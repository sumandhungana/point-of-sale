package com.puff.tech.inventorymanagement.usecase.purchasebill.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.inventorymanagement.repository.PurchaseBillEntity;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllPurchaseBillUC implements FluxUC<GetAllPurchaseBillUCRequest, GetAllPurchaseBillUCResponse> {
    private final PurchaseBillRepository purchaseBillRepository;

    public GetAllPurchaseBillUC(PurchaseBillRepository purchaseBillRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    public Flux<GetAllPurchaseBillUCResponse> execute(GetAllPurchaseBillUCRequest request, UseCaseContext context) {
        return purchaseBillRepository.findAll()
                .map(this::toResponse);
    }

    private GetAllPurchaseBillUCResponse toResponse(PurchaseBillEntity bill) {
        String categoryName = (bill.getProduct() != null && bill.getProduct().getCategory() != null)
                ? bill.getProduct().getCategory().getName()
                : "General";

        String itemName = (bill.getProduct() != null) ? bill.getProduct().getName() : "N/A";
        String itemImageUrl = (bill.getProduct() != null) ? bill.getProduct().getImageUrl() : null;

        return new GetAllPurchaseBillUCResponse(
                bill.getId(),
                bill.getPurchaseNo(),
                bill.getPurchaseDate(),
                bill.getAmount(),
                bill.getPaymentMode(),
                bill.getRemarks(),
                bill.getPhotoPath(),
                new GetAllPurchaseBillUCResponse.CategoryDto(categoryName),
                new GetAllPurchaseBillUCResponse.ItemDto(itemName, itemImageUrl)
        );
    }
}
