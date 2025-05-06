package com.example.recipe.repository;

import com.example.recipe.entity.CalendarItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface CalendarItemRepository extends MongoRepository<CalendarItem, String> {
    Optional<CalendarItem> findByTenantIdAndDate(String tenantId, LocalDate date);
}
