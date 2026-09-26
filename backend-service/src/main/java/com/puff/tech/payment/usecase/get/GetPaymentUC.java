package com.puff.tech.payment.usecase.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.repository.PaymentEntity;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicReference;

@Singleton
public class GetPaymentUC implements FluxUC<GetPaymentUCRequest, GetPaymentUCResponse> {

    private final PaymentRepository paymentRepository;

    public GetPaymentUC(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Flux<GetPaymentUCResponse> execute(GetPaymentUCRequest request, UseCaseContext context) {
        // 1. Validation for null request or null party
        if (request == null || request.paymentParty() == null || request.partyId() == null) {
            return Flux.error(new IllegalArgumentException("Payment party and party ID must not be null"));
        }

        // 2. Safe casting from Long partyId to Integer expected by repository
        Integer targetId = request.partyId().intValue();
        PaymentParty party = request.paymentParty();

        // 3. Dynamic query routing based on PaymentParty enum
        Flux<PaymentEntity> paymentEntityFlux = switch (party) {
            case CUSTOMER -> paymentRepository.findByPaymentPartyAndCustomerIdOrderByCreatedAtDesc(party, targetId);
            case SUPPLIER -> paymentRepository.findByPaymentPartyAndSupplierIdOrderByCreatedAtDesc(party, targetId);
            case STAFF -> paymentRepository.findByPaymentPartyAndStaffIdOrderByCreatedAtDesc(party, targetId);
            default -> Flux.error(new IllegalArgumentException("Unsupported payment party type: " + party));
        };
        // Thread-safe container to track running balance across emissions
        AtomicReference<BigDecimal> runningBalance = new AtomicReference<>(BigDecimal.ZERO);

        return paymentEntityFlux.map(entity -> {
            BigDecimal oldBalance = runningBalance.get();
            BigDecimal amount = entity.getAmount() != null ? entity.getAmount() : BigDecimal.ZERO;

            BigDecimal newBalance;
            if (entity.getPaymentCategory() == PaymentCategory.RECEIVED) {
                newBalance = oldBalance.add(amount);
            } else if (entity.getPaymentCategory() == PaymentCategory.GIVEN) {
                newBalance = oldBalance.subtract(amount);
            } else {
                newBalance = oldBalance;
            }

            // Update state for next item in the stream
            runningBalance.set(newBalance);

            return mapToResponse(entity, oldBalance, newBalance);
        });

        // 4. Map Entity to Response DTO
//        return paymentEntityFlux.map(this::mapToResponse);
    }

    private GetPaymentUCResponse mapToResponse(PaymentEntity entity,BigDecimal oldBalance, BigDecimal newBalance) {
        return new GetPaymentUCResponse(
                entity.getId(),
                entity.getPaymentParty(),
                entity.getAmount(),
                entity.getPaymentType(),
                entity.getPaymentCategory(),
                entity.getBillPath(),
                entity.getRemarks(),
                entity.getCreatedAt(),
                oldBalance,
                newBalance,
                entity.getUpdatedAt()
        );
    }
}
