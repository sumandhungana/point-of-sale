package com.puff.tech.depositmanagement.usecase.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.depositmanagement.convertor.DepositConvertor;
import com.puff.tech.depositmanagement.repository.DepositRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;


@Singleton
public class GetDepositUC implements FluxUC<GetDepositUCRequest, GetDepositUCResponse> {

    private final DepositRepository depositRepository;

    public GetDepositUC(DepositRepository depositRepository) {
        this.depositRepository = depositRepository;
    }


    @Override
    public Flux<GetDepositUCResponse> execute(GetDepositUCRequest request, UseCaseContext context) {
        return depositRepository.findByPartyIdOrderByCreatedAtDesc(request.partyId())
                .map(DepositConvertor::toResponse)
                .onErrorResume(err-> Flux.error(new Throwable("Failed to fetch deposit" +err.getLocalizedMessage())));
    }
}
