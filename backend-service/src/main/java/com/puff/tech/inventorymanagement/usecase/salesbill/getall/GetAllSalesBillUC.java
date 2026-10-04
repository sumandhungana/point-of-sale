package com.puff.tech.inventorymanagement.usecase.salesbill.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetAllSalesBillUC implements FluxUC<GetAllSalesBillUCRequest, GetAllSalesBillUCResponse> {

    private final SalesBillRepository salesBillRepository;

    public GetAllSalesBillUC(SalesBillRepository salesBillRepository) {
        this.salesBillRepository = salesBillRepository;
    }

    @Override
    @Transactional
    public Flux<GetAllSalesBillUCResponse> execute(GetAllSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return this.salesBillRepository.findByMemberId(memberId)
                .switchIfEmpty(Mono.empty())
                .map(this::prepareSalesBillResponse);
    }

    private GetAllSalesBillUCResponse prepareSalesBillResponse(SalesBillEntity entity) {
        return GetAllSalesBillUCResponse.builder()
                .id(entity.getId())
                .billNumber(entity.getBillNumber())
                .customerName(entity.getCustomer().getName())
                .productName(entity.getProduct().getName())
                .billAmount(entity.getAmount())
                .paymentMode(entity.getPaymentMode())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
