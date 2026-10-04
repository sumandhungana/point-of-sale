package com.puff.tech.inventorymanagement.usecase.salesbill.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.inventorymanagement.repository.ProductEntity;
import com.puff.tech.inventorymanagement.repository.ProductRepository;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Singleton
public class AddSalesBillUC implements MonoUC<AddSalesBillUCRequest, AddSalesBillUCResponse> {

    private final SalesBillRepository salesBillRepository;
    private final ProductRepository productRepository;

    public AddSalesBillUC(SalesBillRepository salesBillRepository,
                          ProductRepository productRepository) {
        this.salesBillRepository = salesBillRepository;
        this.productRepository = productRepository;
    }


    @Override
    @Transactional
    public Mono<AddSalesBillUCResponse> execute(AddSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return validateRequest(request)
                .then(salesBillRepository.acquireMemberLock(memberId))
                .thenMany(processItemsStock(request.items(),memberId))
                .collectList()
                .flatMap(processedItems -> saveSalesBills(request, processedItems, context))
                .map(this::buildResponse);
    }

    // --- Private Helper Methods ---

    /**
     * Validates input request basic constraints.
     */
    private Mono<Void> validateRequest(AddSalesBillUCRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Sales bill must contain at least one item."));
        }
        return Mono.empty();
    }

    /**
     * Processes stock updates for all line items reactively.
     */
    private Flux<AddSalesBillUCRequest.SalesBillItemRequest> processItemsStock(
            List<AddSalesBillUCRequest.SalesBillItemRequest> items, Long memberId) {
        return Flux.fromIterable(items)
                .flatMap(item -> decrementAndVerifyStock(item, memberId));
    }

    /**
     * Atomically decrements stock and verifies sufficient stock was available.
     */
    private Mono<AddSalesBillUCRequest.SalesBillItemRequest> decrementAndVerifyStock(
            AddSalesBillUCRequest.SalesBillItemRequest item, Long memberId) {
        return productRepository.decrementStock(item.itemId(), memberId, item.quantity())
                .flatMap(updatedRows -> {
                    if (updatedRows == 0) {
                        return Mono.error(new IllegalStateException(
                                "Insufficient stock or item not found for ID: " + item.itemId()));
                    }
                    return Mono.just(item);
                });
    }

    /**
     * Converts items into SalesBillEntity instances and persists them.
     */
    private Mono<List<SalesBillEntity>> saveSalesBills(
            AddSalesBillUCRequest request,
            List<AddSalesBillUCRequest.SalesBillItemRequest> items,
            UseCaseContext context) {

        List<SalesBillEntity> entities = items.stream()
                .map(item -> createSalesBillEntity(request, item, context))
                .toList();

        return salesBillRepository.saveAll(entities).collectList();
    }

    /**
     * Maps a single request item and header info into a SalesBillEntity.
     */
    private SalesBillEntity createSalesBillEntity(
            AddSalesBillUCRequest request,
            AddSalesBillUCRequest.SalesBillItemRequest item,
            UseCaseContext context) {

        SalesBillEntity entity = new SalesBillEntity();
        entity.setBillNumber(request.billNumber());
        entity.setBillDate(request.billDate());
        entity.setPaymentMode(request.paymentMode());
        entity.setAmount(item.totalPrice());
        entity.setRemarks(request.remarks());
        entity.setPhotoPath(request.photoPath());
        if (request.customerId() != null) {
            OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
            customer.setId(Math.toIntExact(request.customerId()));
            entity.setCustomer(customer);
        }

        MemberEntity member = new MemberEntity();
        member.setId(context.securityContext().memberId());
        entity.setMember(member);

        ProductEntity product = new ProductEntity();
        product.setId(item.itemId());
        entity.setProduct(product);

        entity.setCreatedBy(context.securityContext().subject());
        entity.setUpdatedBy(context.securityContext().subject());

        return entity;
    }

    /**
     * Builds the final UC response.
     */
    private AddSalesBillUCResponse buildResponse(List<SalesBillEntity> savedBills) {
        String primaryId = savedBills.isEmpty() ? "" : savedBills.getFirst().getId().toString();
        return new AddSalesBillUCResponse(primaryId, "Sales bill added successfully.");
    }
}
