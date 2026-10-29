package com.puff.tech.inventorymanagement.usecase.purchasebill.getsingle;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.PurchaseBillEntity;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSinglePurchaseBillUC implements MonoUC<GetSinglePurchaseBillUCRequest, GetSinglePurchaseBillUCResponse> {
    private final PurchaseBillRepository purchaseBillRepository;

    public GetSinglePurchaseBillUC(PurchaseBillRepository purchaseBillRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    public Mono<GetSinglePurchaseBillUCResponse> execute(GetSinglePurchaseBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return purchaseBillRepository.findByIdAndMemberId(request.id(), memberId)
                .map(this::toResponse);
    }

    private GetSinglePurchaseBillUCResponse toResponse(PurchaseBillEntity bill) {
        String categoryName = (bill.getProduct() != null && bill.getProduct().getCategory() != null)
                ? bill.getProduct().getCategory().getName()
                : "General";

        String itemName = (bill.getProduct() != null) ? bill.getProduct().getName() : "N/A";
        String itemImageUrl = (bill.getProduct() != null) ? bill.getProduct().getImageUrl() : null;

        return new GetSinglePurchaseBillUCResponse(
                bill.getId(),
                bill.getPurchaseNo(),
                bill.getPurchaseDate(),
                bill.getAmount(),
                bill.getPaymentMode(),
                bill.getPaymentStatus(),
                bill.getRemarks(),
                bill.getPhotoPath(),
                new GetSinglePurchaseBillUCResponse.CategoryDto(categoryName),
                new GetSinglePurchaseBillUCResponse.ItemDto(itemName, itemImageUrl)
        );
    }
}
