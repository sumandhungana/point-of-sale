package com.puff.tech.inventorymanagement.usecase.purchasebill.update;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.PurchaseBillEntity;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Singleton
public class UpdatePurchaseBillUC implements MonoUC<UpdatePurchaseBillUCRequest, UpdatePurchaseBillUCResponse> {

    private final PurchaseBillRepository purchaseBillRepository;
    private final ProductRepository productRepository;

    public UpdatePurchaseBillUC(PurchaseBillRepository purchaseBillRepository,
                                ProductRepository productRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public Mono<UpdatePurchaseBillUCResponse> execute(UpdatePurchaseBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        if ((request.id() == null || request.id() <= 0) && (request.purchaseNo() == null || request.purchaseNo().isBlank())) {
            return Mono.error(new IllegalArgumentException("Either purchase bill ID or purchaseNo is required for update."));
        }

        Mono<PurchaseBillEntity> findBillMono = (request.id() != null && request.id() > 0)
                ? purchaseBillRepository.findByIdAndMemberId(request.id(), memberId)
                : purchaseBillRepository.findByPurchaseNoAndMemberId(request.purchaseNo(), memberId).next();

        return findBillMono
                .switchIfEmpty(Mono.error(new RuntimeException("Purchase bill not found for update")))
                .flatMap(existingEntity -> {
                    String purchaseNoToUpdate = existingEntity.getPurchaseNo();

                    Flux<PurchaseBillEntity> billsFlux = (purchaseNoToUpdate != null && !purchaseNoToUpdate.isBlank())
                            ? purchaseBillRepository.findByPurchaseNoAndMemberId(purchaseNoToUpdate, memberId)
                            : Flux.just(existingEntity);

                    return billsFlux
                            .flatMap(entity -> {
                                if (request.purchaseDate() != null) {
                                    entity.setPurchaseDate(request.purchaseDate());
                                }
                                if (request.paymentMode() != null && !request.paymentMode().isBlank()) {
                                    entity.setPaymentMode(request.paymentMode());
                                }
                                if (request.paymentStatus() != null && !request.paymentStatus().isBlank()) {
                                    entity.setPaymentStatus(request.paymentStatus());
                                }
                                if (request.remarks() != null) {
                                    entity.setRemarks(request.remarks());
                                }
                                if (request.photoPath() != null) {
                                    entity.setPhotoPath(request.photoPath());
                                }
                                if (request.supplierId() != null && request.supplierId() > 0) {
                                    SupplierEntity supplier = new SupplierEntity();
                                    supplier.setId(Math.toIntExact(request.supplierId()));
                                    entity.setSupplier(supplier);
                                }

                                if (request.items() != null && !request.items().isEmpty()) {
                                    BigDecimal totalAmount = request.items().stream()
                                            .map(i -> (i.perUnitPurchasePrice() != null ? i.perUnitPurchasePrice() : BigDecimal.ZERO)
                                                    .multiply(BigDecimal.valueOf(i.itemCount() != null ? i.itemCount() : 1.0)))
                                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                                    entity.setAmount(totalAmount);
                                }

                                entity.setUpdatedBy(context.securityContext().subject());
                                return purchaseBillRepository.update(entity);
                            })
                            .collectList()
                            .map(list -> new UpdatePurchaseBillUCResponse(
                                    existingEntity.getId(),
                                    existingEntity.getPurchaseNo(),
                                    "Purchase bill updated successfully."
                            ));
                });
    }
}
