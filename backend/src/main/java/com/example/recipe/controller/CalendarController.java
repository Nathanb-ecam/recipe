package com.example.recipe.controller;

import com.example.recipe.dto.requests.CalendarRequest;
import com.example.recipe.entity.CalendarItem;
import com.example.recipe.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/users/{tenantId}/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }


    @GetMapping("/{date}")
    public ResponseEntity<CalendarItem> getCalendarItem(
            @PathVariable("tenantId") String tenantId,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @PathVariable LocalDate date){

        CalendarItem calendarItem = calendarService.getCalendarItem(tenantId, date);

        return ResponseEntity.ok(calendarItem);
    }

    // POST: Create a new CalendarItem for a given user (tenantId)
    @PostMapping
    public ResponseEntity<CalendarItem> createCalendarItem(
            @PathVariable String tenantId,
            @RequestBody @Valid CalendarItem calendarItem) {
        CalendarItem createdItem = calendarService.createCalendarItem(tenantId, calendarItem);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }


/*    @PutMapping
    public ResponseEntity<CalendarItem> updateCalendarItem(
            @PathVariable String tenantId,
            //@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @PathVariable LocalDate date,
            @RequestBody @Valid CalendarUpdateRequest updateRequest) {

        CalendarItem updatedItem = calendarService.updateCalendarItem(tenantId, updateRequest);

        return ResponseEntity.ok(updatedItem);
    }*/

    @PutMapping
    public ResponseEntity<CalendarItem> appendMealToCalendarItem(
            @PathVariable String tenantId,
            //@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @PathVariable LocalDate date,
            @RequestBody @Valid CalendarRequest updateRequest) {

        CalendarItem updatedItem = calendarService.mergeMealPlans(tenantId, updateRequest);


        return ResponseEntity.ok(updatedItem);
    }


    @DeleteMapping
    public ResponseEntity<?> deleteMealEvent(
            @PathVariable String tenantId,
            @RequestBody @Valid CalendarRequest deleteRequest) {

        calendarService.deleteMealEvents(tenantId, deleteRequest);
        return ResponseEntity.noContent().build();
    }






}
