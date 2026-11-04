package com.puff.tech.depositmanagement.usecase.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.depositmanagement.convertor.DepositConvertor;
import com.puff.tech.depositmanagement.repository.DepositRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddDepositUC implements MonoUC<AddDepositUCRequest, AddDepositUCResponse> {

    private final DepositRepository depositRepository;

    public AddDepositUC(DepositRepository depositRepository) {
        this.depositRepository = depositRepository;
    }

    @Override
    public Mono<AddDepositUCResponse> execute(AddDepositUCRequest request, UseCaseContext context) {
        var deposit = DepositConvertor.toEntity(request, context.securityContext());

        return depositRepository.save(deposit)
                .map(savedDeposit -> AddDepositUCResponse.builder()
                        .id(savedDeposit.getId())
                        .message("Amount deposited successfully")
                        .build())
                .onErrorResume(err ->
                  Mono.just(AddDepositUCResponse.builder()
                            .id(-1L)
                            .message("Amount deposit failed: " + err.getMessage())
                            .build())
                );
    }
}
