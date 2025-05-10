package com.example.recipe.service;

import com.example.recipe.dto.MealEvent;
import com.example.recipe.dto.requests.CalendarUpdateRequest;
import com.example.recipe.entity.CalendarItem;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.repository.CalendarItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CalendarService {

    private final UserService userService;
    private final CalendarItemRepository calendarItemRepository;

    public CalendarService(UserService userService, CalendarItemRepository calendarItemRepository) {
        this.userService = userService;
        this.calendarItemRepository = calendarItemRepository;
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


    public CalendarItem updateCalendarItem(String tenantId, CalendarUpdateRequest updateRequest) {
        userService.CheckUserAllowedToAccessResource(tenantId);

        LocalDate date = updateRequest.getDate();

        // Find or create the CalendarItem
        CalendarItem calendarItem = calendarItemRepository
                .findByTenantIdAndDate(tenantId, date)
                .orElseGet(() -> {
                    CalendarItem newItem = new CalendarItem();
                    newItem.setTenantId(tenantId);
                    newItem.setDate(date);
                    return newItem;
                });


        calendarItem.setMealEvents(updateRequest.getMealEvents());

        return calendarItemRepository.save(calendarItem);



    }

}
