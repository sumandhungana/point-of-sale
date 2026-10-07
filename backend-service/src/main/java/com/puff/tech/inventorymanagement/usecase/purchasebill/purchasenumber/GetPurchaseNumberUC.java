package com.puff.tech.inventorymanagement.usecase.purchasebill.purchasenumber;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.PurchaseBillRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Singleton
public class GetPurchaseNumberUC implements MonoUC<GetPurchaseNumberUCRequest, GetPurchaseNumberUCResponse> {

    private final PurchaseBillRepository purchaseBillRepository;

    public GetPurchaseNumberUC(PurchaseBillRepository purchaseBillRepository) {
        this.purchaseBillRepository = purchaseBillRepository;
    }

    @Override
    @Transactional
    public Mono<GetPurchaseNumberUCResponse> execute(GetPurchaseNumberUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return purchaseBillRepository.acquireMemberLock(memberId)
                .then(Mono.defer(() -> purchaseBillRepository.findLastSequenceByMemberId(memberId)))
                .map(Optional::ofNullable)
                .defaultIfEmpty(Optional.of(0L))
                .map(optLastSeq -> {
                    long lastSeq = optLastSeq.orElse(0L);
                    long nextSeq = lastSeq + 1;
                    String newBillNumber = String.format("BILL-%d-%d", memberId, nextSeq);
                    return new GetPurchaseNumberUCResponse(newBillNumber);
                });
    }
}
