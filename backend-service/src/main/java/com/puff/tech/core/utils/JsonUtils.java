package com.puff.tech.core.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;

public class JsonUtils {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private JsonUtils() {
    }

    public static String toJsonString(Object object) {
        try {
            return OBJECT_MAPPER.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to convert object to JSON", e);
        }
    }

    public static String listToJsonString(List<?> list) {
        return toJsonString(list);
    }

    /**
     * Converts a JSON string into a List of a specific target class/DTO.
     * Example: List<RowDto> rows = JsonUtils.toList(jsonString, RowDto.class);
     */
    public static <T> List<T> toList(String jsonString, Class<T> elementType) {
        if (jsonString == null || jsonString.isBlank()) {
            return Collections.emptyList();
        }
        try {
            JavaType type = OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, elementType);
            return OBJECT_MAPPER.readValue(jsonString, type);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to convert JSON string to List", e);
        }
    }

    /**
     * Converts a JSON string into a generic List (e.g., List> or List<Object>).
     * Ideal for unstructured JSON like your row/widget configuration.
     */
    public static <T> List<T> toList(String jsonString, TypeReference<List<T>> typeReference) {
        if (jsonString == null || jsonString.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(jsonString, typeReference);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to convert JSON string to List", e);
        }
    }
}
