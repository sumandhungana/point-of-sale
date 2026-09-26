package com.puff.tech.payment.usecase.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.payment.repository.PaymentEntity;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.repository.OrganizationStaffEntity;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddPaymentUC implements MonoUC<AddPaymentUCRequest, AddPaymentUCResponse> {

    private final PaymentRepository paymentRepository;

    public AddPaymentUC(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Mono<AddPaymentUCResponse> execute(AddPaymentUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        String userId = context.securityContext().userId();
        PaymentEntity entity = buildPaymentEntity(request, memberId, userId);

        return paymentRepository.save(entity)
                .map(saved -> new AddPaymentUCResponse(
                        String.valueOf(saved.getId()),
                        "Payment added successfully"
                ));
    }

    private PaymentEntity buildPaymentEntity(AddPaymentUCRequest request, Long memberId, String userId) {
        PaymentEntity entity = new PaymentEntity();

        // Security / Audit context
        MemberEntity member = new MemberEntity();
        member.setId(memberId);
        entity.setMember(member);

        UserInfoEntity user = new UserInfoEntity();
        user.setId(Long.valueOf(userId));
        entity.setUser(user);

        entity.setCreatedBy(userId);

        // Core fields
        entity.setPaymentParty(request.paymentParty());
        entity.setAmount(request.amount());
        entity.setPaymentType(request.paymentType());
        entity.setPaymentCategory(request.paymentCategory());
        entity.setBillPath(request.billPath());
        entity.setRemarks(request.remarks());

        // Attach relationship entities based on party type
        switch (request.paymentParty()) {
            case CUSTOMER -> {
                if (request.customerId() != null) {
                    OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
                    customer.setId(Math.toIntExact(request.customerId()));
                    entity.setCustomer(customer);
                }
            }
            case SUPPLIER -> {
                if (request.supplierId() != null) {
                    SupplierEntity supplier = new SupplierEntity();
                    supplier.setId(Math.toIntExact(request.supplierId()));
                    entity.setSupplier(supplier);
                }
            }
            case STAFF -> {
                if (request.staffId() != null) {
                    OrganizationStaffEntity staff = new OrganizationStaffEntity();
                    staff.setId(Math.toIntExact(request.staffId()));
                    entity.setStaff(staff);
                }
            }
            case AUDIT -> {
                // No secondary party reference needed
            }
        }

        return entity;
    }
}
