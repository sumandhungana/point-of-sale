package com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Singleton
public class GetBillNumberUC implements MonoUC<GetBillNumberUCRequest, GetBillNumberUCResponse> {
    private final SalesBillRepository salesBillRepository;

    public GetBillNumberUC(SalesBillRepository salesBillRepository) {
        this.salesBillRepository = salesBillRepository;
    }

    @Override
    @Transactional
    public Mono<GetBillNumberUCResponse> execute(GetBillNumberUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return salesBillRepository.acquireMemberLock(memberId)
                .then(Mono.defer(() -> salesBillRepository.findLastSequenceByMemberId(memberId)))
                .map(Optional::ofNullable)
                .defaultIfEmpty(Optional.of(0L))
                .map(optLastSeq -> {
                    long lastSeq = optLastSeq.orElse(0L);
                    long nextSeq = lastSeq + 1;
                    String newBillNumber = String.format("BILL-%d-%d", memberId, nextSeq);
                    return new GetBillNumberUCResponse(newBillNumber);
                });
    }
}
