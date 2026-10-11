package com.puff.tech.rentalitem.usecase.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.rentalitem.repository.RentalItemEntity;
import com.puff.tech.rentalitem.repository.RentalItemRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddRentalUC implements MonoUC<AddRentalUCRequest, AddRentalUCResponse> {
    private final RentalItemRepository rentalItemRepository;

    public AddRentalUC(RentalItemRepository rentalItemRepository) {
        this.rentalItemRepository = rentalItemRepository;
    }

    @Override
    @Transactional
    public Mono<AddRentalUCResponse> execute(AddRentalUCRequest request, UseCaseContext context) {
        RentalItemEntity entity = buildRentalEntity(request, context);
        return saveEntity(entity);
    }

    private RentalItemEntity buildRentalEntity(AddRentalUCRequest request, UseCaseContext context) {
        RentalItemEntity entity = new RentalItemEntity();
        mapBasicDetails(entity, request);
        mapDatesAndRemarks(entity, request);
        applySecurityContext(entity, context);
        return entity;
    }

    private void mapBasicDetails(RentalItemEntity entity, AddRentalUCRequest request) {
        entity.setRentalItemName(request.rentalItemName());
        entity.setPhoneNumber(request.phoneNumber());
        entity.setAddress(request.address());
        entity.setRentalAmount(request.rentalAmount());
        entity.setRentalPeriod(request.rentalPeriod());
    }

    private void mapDatesAndRemarks(RentalItemEntity entity, AddRentalUCRequest request) {
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setRemarks(request.remarks());
    }

    private void applySecurityContext(RentalItemEntity entity, UseCaseContext context) {
        if (context == null || context.securityContext() == null) {
            return;
        }

        if (context.securityContext().memberId() != null) {
            MemberEntity member = new MemberEntity();
            member.setId(context.securityContext().memberId());
            entity.setMember(member);
        }

        entity.setCreatedBy(context.securityContext().subject());
    }

    private Mono<AddRentalUCResponse> saveEntity(RentalItemEntity entity) {
        return rentalItemRepository.save(entity)
                .map(this::toResponse);
    }

    private AddRentalUCResponse toResponse(RentalItemEntity savedEntity) {
        return new AddRentalUCResponse(
                savedEntity.getId(),
                savedEntity.getRentalItemName()
        );
    }
}
