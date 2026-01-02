
import { GoogleGenAI, Type } from "@google/genai";
import { Project, SurveyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSurvey = async (survey: SurveyData, project: Project) => {
  const prompt = `
    Analise os seguintes dados de vistoria técnica fotovoltaica e forneça recomendações de engenharia:
    Cliente: ${project.clientName}
    Potência Estimada: ${project.powerKwp} kWp
    Tipo de Telhado: ${survey.roofType}
    Azimute: ${survey.azimuth}°
    Inclinação: ${survey.inclination}°
    Problemas de Sombreamento: ${survey.shadingIssues}
    Estado do Quadro Elétrico: ${survey.electricalPanelStatus}

    Forneça uma análise técnica concisa sobre a viabilidade, sugestões de melhoria no layout e alertas de segurança.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};

export const generateTechnicalMemorial = async (project: Project) => {
  const prompt = `
    Gere um rascunho de Memorial Descritivo para submissão à concessionária de energia.
    Dados do Projeto:
    - Cliente: ${project.clientName}
    - Endereço: ${project.address}
    - Potência do Gerador: ${project.powerKwp} kWp
    - Produção Mensal Estimada: ${project.estimatedProduction} kWh
    
    O documento deve conter: Introdução, Descrição do Sistema, Características Técnicas dos Equipamentos (módulos e inversor), e Proteções. Use um tom profissional e técnico de engenharia elétrica.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });

  return response.text;
};
