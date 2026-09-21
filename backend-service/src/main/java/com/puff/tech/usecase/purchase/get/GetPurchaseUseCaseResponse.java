package com.puff.tech.usecase.purchase.get;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.entity.CategoryEntity;
import com.puff.tech.entity.ItemEntity;
import com.puff.tech.entity.KhataBookEntity;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetPurchaseUseCaseResponse(
            Integer id,
            Integer khataBookId,
            KhataBookEntity khataBook,
            String purchaseNo,
            LocalDate date,
            Integer categoryId,
            Integer itemId,
            String paymentMode,
            BigDecimal amount,
            String remarks,
            String photoPath,
            Instant createdAt,
            CategoryEntity category,
            ItemEntity item
)
implements UseCases.UseCaseResponse {
}
