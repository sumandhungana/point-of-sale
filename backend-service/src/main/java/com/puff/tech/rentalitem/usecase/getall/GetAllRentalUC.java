package com.puff.tech.rentalitem.usecase.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.rentalitem.repository.RentalItemEntity;
import com.puff.tech.rentalitem.repository.RentalItemRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllRentalUC implements FluxUC<GetAllRentalUCRequest, GetAllRentalUCResponse> {

    private final RentalItemRepository rentalItemRepository;

    public GetAllRentalUC(RentalItemRepository rentalItemRepository) {
        this.rentalItemRepository = rentalItemRepository;
    }

    @Override
    @Transactional
    public Flux<GetAllRentalUCResponse> execute(GetAllRentalUCRequest request, UseCaseContext context) {
        return fetchAllEntities()
                .map(this::mapToResponse);
    }

    private Flux<RentalItemEntity> fetchAllEntities() {
        return rentalItemRepository.findAll();
    }

    private GetAllRentalUCResponse mapToResponse(RentalItemEntity entity) {
        return new GetAllRentalUCResponse(
                entity.getId(),
                entity.getRentalItemName(),
                entity.getPhoneNumber(),
                entity.getAddress(),
                entity.getRentalAmount(),
                entity.getRentalPeriod(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getRemarks(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
