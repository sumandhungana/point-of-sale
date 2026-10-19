package com.puff.tech.staffmanagement.usecase.staff.update;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateStaffUseCase implements UseCases<UpdateStaffUseCaseRequest,UpdateStaffUseCaseResponse> {



    @Inject
    public UpdateStaffUseCase() {

    }

    @Override
    public Mono<UpdateStaffUseCaseResponse> execute(UpdateStaffUseCaseRequest request) {
        return null;
    }
}
