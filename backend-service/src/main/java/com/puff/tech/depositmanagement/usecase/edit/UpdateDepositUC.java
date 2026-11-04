package com.puff.tech.depositmanagement.usecase.edit;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.depositmanagement.convertor.DepositConvertor;
import com.puff.tech.depositmanagement.repository.DepositRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateDepositUC implements MonoUC<UpdateDepositUCRequest, UpdateDepositUCResponse> {

    private final DepositRepository depositRepository;

    public UpdateDepositUC(DepositRepository depositRepository) {
        this.depositRepository = depositRepository;
    }


    @Override
    public Mono<UpdateDepositUCResponse> execute(UpdateDepositUCRequest request, UseCaseContext context) {
        return depositRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new Throwable("Deposit did not found")))
                .flatMap(deposit -> {
                    var newDeposit= DepositConvertor.toUpdate(deposit,request);
                    return depositRepository.update(newDeposit)
                            .map(newSavedDeposit-> new UpdateDepositUCResponse("Deposit updated successfully"))
                            .onErrorResume(err-> Mono.just(new UpdateDepositUCResponse("Failed to fetch the deposit: " +err.getLocalizedMessage())));
                });
    }
}
