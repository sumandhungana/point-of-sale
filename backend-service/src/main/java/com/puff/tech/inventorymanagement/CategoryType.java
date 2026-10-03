package com.puff.tech.inventorymanagement;

import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
public enum CategoryType {
    GENERAL(0), INCOME(1), EXPENSES(2),
    PURCHASE(3),CASHBOOK(4);

    private final Integer typeId;
    CategoryType(Integer typeId) {
        this.typeId = typeId;
    }
    private static final Map<Integer, CategoryType> BY_TYPE_ID = Arrays.stream(values())
            .collect(Collectors.toMap(CategoryType::getTypeId, Function.identity()));

    /**
     * Find CategoryType by typeId returning an Optional.
     *
     * @param typeId the integer ID of the category type
     * @return Optional containing the matching CategoryType, or Optional.empty() if not found
     */
    public static Optional<CategoryType> findByTypeId(Integer typeId) {
        if (typeId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(BY_TYPE_ID.get(typeId));
    }

    /**
     * Find CategoryType by typeId or return a default value if not found.
     *
     * @param typeId the integer ID
     * @param defaultValue default enum to return if typeId is invalid/null
     * @return matching CategoryType or default
     */
    public static CategoryType fromTypeIdOrDefault(Integer typeId, CategoryType defaultValue) {
        return findByTypeId(typeId).orElse(defaultValue);
    }
}
