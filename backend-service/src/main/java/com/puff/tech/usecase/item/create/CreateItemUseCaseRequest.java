package com.puff.tech.usecase.item.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateItemUseCaseRequest(
        String name,
        String primaryUnit,
        String secondaryUnit,
        Boolean isSecondaryUnitEnabled,
        Integer categoryId,
        BigDecimal salesPrice,
        BigDecimal purchasePrice,
        Boolean taxIncluded,
        BigDecimal openingStock,
        BigDecimal lowStockAlert,
        BigDecimal vatPercentage,
        BigDecimal vatPercentageToday,
        LocalDate vatDate,
        String photoPath
)
implements UseCases.UseCaseRequest {
}
