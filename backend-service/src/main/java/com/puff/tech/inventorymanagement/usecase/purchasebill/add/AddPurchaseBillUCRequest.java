package com.puff.tech.inventorymanagement.usecase.purchasebill.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Serdeable
public record AddPurchaseBillUCRequest(
        @NotBlank String purchaseNo,
        @NotNull LocalDate purchaseDate,
        @NotBlank String paymentMode,
        Long supplierId,
        String remarks,
        String photoPath,
        @NotEmpty List<PurchaseItemDto> items
) implements UCRequest {

    @Serdeable
    public record PurchaseItemDto(
            @NotNull Long productId,
            @NotNull Double itemCount,
            @NotNull BigDecimal perUnitPurchasePrice
    ) {}
}
