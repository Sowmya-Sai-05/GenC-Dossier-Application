package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIFluencyDto {
    private List<AIFluencyStatusDto> aiSkills;
    private List<AIFluencyStatusDto> aiCertifications;
}
