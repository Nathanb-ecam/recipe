package com.example.recipe.service;

import com.example.recipe.dto.MealEvent;
import com.example.recipe.dto.requests.CalendarRequest;
import com.example.recipe.entity.CalendarItem;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.model.MealType;
import com.example.recipe.repository.CalendarItemRepository;
import com.example.recipe.repository.RecipeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@Service
public class CalendarService {

    private final UserService userService;
    private final CalendarItemRepository calendarItemRepository;
    private final RecipeRepository recipeRepository;

    public CalendarService(UserService userService, CalendarItemRepository calendarItemRepository, RecipeRepository recipeRepository) {
        this.userService = userService;
        this.calendarItemRepository = calendarItemRepository;
        this.recipeRepository = recipeRepository;
    }


    public CalendarItem getCalendarItem(String tenantId, LocalDate date) {
        // Find the CalendarItems by tenantId and date (MongoDB query based on the unique index created earlier)
        Optional<CalendarItem> calendarItems = calendarItemRepository.findByTenantIdAndDate(tenantId, date);

        if (calendarItems.isEmpty()) {
            // Optionally, throw an exception if no records found or return an empty list
            throw new NoContentException("Calendar item not found");
        }

        return calendarItems.get();
    }

    public CalendarItem createCalendarItem(String tenantId, CalendarItem calendarItem) {
        userService.CheckUserAllowedToAccessResource(tenantId);

        // Ensure the tenantId is set to the user's tenantId
        calendarItem.setTenantId(tenantId);
        calendarItem.setDate(calendarItem.getDate().atStartOfDay().toLocalDate());

        // Validation if necessary
        return calendarItemRepository.save(calendarItem);
    }


    public void deleteMealEvents(String tenantId, CalendarRequest calendarRequest) {
        LocalDate date = calendarRequest.getDate();

        CalendarItem calendarItem = calendarItemRepository.findByTenantIdAndDate(tenantId, date)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar item not found"));

        List<MealEvent> existingEvents = calendarItem.getMealEvents();

        if (existingEvents == null || existingEvents.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No meal events found to delete");
        }

        List<MealEvent> eventsToDelete = calendarRequest.getMealEvents();
        if (eventsToDelete == null || eventsToDelete.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No meal events provided for deletion");
        }

        int initialSize = existingEvents.size();

        // Remove matching meal events
        existingEvents.removeIf(existing -> eventsToDelete.stream().anyMatch(toDelete ->
                existing.getMealType().toString().equalsIgnoreCase(toDelete.getMealType().toString()) &&
                        (
                                (toDelete.getRecipeId() != null && toDelete.getRecipeId().equals(existing.getRecipeId())) ||
                                        (toDelete.getEventName() != null && toDelete.getEventName().equalsIgnoreCase(existing.getEventName()))
                        )
        ));

        if (existingEvents.size() == initialSize) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No matching meal events found to delete");
        }

        calendarItem.setMealEvents(existingEvents);
        calendarItemRepository.save(calendarItem);
    }




    public CalendarItem mergeMealPlans(String tenantId, CalendarRequest updateRequest) {
        // Convert date string to LocalDate
        LocalDate date = updateRequest.getDate();

        // Find existing calendar item or create new one
        CalendarItem calendarItem = calendarItemRepository.findByTenantIdAndDate(tenantId, date)
                .orElseGet(() -> {
                    CalendarItem newItem = new CalendarItem();
                    newItem.setTenantId(tenantId);
                    newItem.setDate(date);
                    return newItem;
                });

        // Get existing meal events (could be null or empty)
        List<MealEvent> existingMealEvents = calendarItem.getMealEvents();
        if (existingMealEvents == null) {
            existingMealEvents = new ArrayList<>();
        }

        // Get updated meal events from request
        List<MealEvent> updatedMealEvents = updateRequest.getMealEvents();

        // Validate new meal events
        validateMealEvents(updatedMealEvents);

        // Merge logic: replace existing event with same mealType or add new ones
        Map<String, MealEvent> mergedMap = new HashMap<>();

        // Put existing ones in map
        for (MealEvent event : existingMealEvents) {
            mergedMap.put(event.getMealType().toString(), event);
        }

        // Overwrite or add updated ones
        for (MealEvent newEvent : updatedMealEvents) {
            mergedMap.put(newEvent.getMealType().toString(), newEvent);
        }

        // Set merged list back to calendar item
        calendarItem.setMealEvents(new ArrayList<>(mergedMap.values()));

        // Save and return
        return calendarItemRepository.save(calendarItem);
    }


    private void validateMealEvents(List<MealEvent> mealEvents) {
        for (MealEvent event : mealEvents) {
            // Validate meal type
            if (!isValidMealType(event.getMealType().toString())) {
                throw new IllegalArgumentException("Invalid meal type: " + event.getMealType());
            }

            // If recipeId is provided, validate it exists
            if (event.getRecipeId() != null && !event.getRecipeId().isEmpty()) {
                if (!recipeRepository.existsById(event.getRecipeId())) {
                    throw new IllegalArgumentException("Recipe not found with id: " + event.getRecipeId());
                }
            }

            // If no recipeId, ensure eventName is provided
            if ((event.getRecipeId() == null || event.getRecipeId().isEmpty())
                    && (event.getEventName() == null || event.getEventName().isEmpty())) {
                throw new IllegalArgumentException("Either recipeId or eventName must be provided");
            }
        }
    }

    private boolean isValidMealType(String mealType) {
        return Arrays.asList("BREAKFAST", "LUNCH", "DINNER").contains(mealType);
    }



}
