
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

export const getEquipmentSpecs = async (brand: string, model: string, type: 'Módulo' | 'Inversor') => {
  const prompt = `
    Aja como um engenheiro fotovoltaico especialista. 
    Retorne APENAS um objeto JSON (sen nenhum outro texto) com as especificações técnicas REAIS para o seguinte equipamento:
    Marca: ${brand}
    Modelo: ${model}
    Tipo: ${type}

    ${type === 'Módulo' ? `
    O JSON deve seguir este formato:
    {
      "pmax": "valor em W",
      "tolerance": "ex: 0~+5W",
      "vmp": "valor em V",
      "imp": "valor em A",
      "voc": "valor em V",
      "isc": "valor em A",
      "efficiency": "valor em %"
    }` : `
    O JSON deve seguir este formato (baseado no Aiswei Ai-LB ou similar):
    {
      "pvMaxPower": "valor Wp",
      "pvMaxVoltage": "valor V",
      "mpptVoltageRange": "faixa V",
      "minStartVoltage": "valor V",
      "mpptCount": "contagem",
      "maxMpptCurrent": "valor A",
      "maxShortCircuitCurrent": "valor A",
      "batteryNominalVoltage": "valor V",
      "batteryVoltageRange": "faixa V",
      "batteryMaxPower": "valor W",
      "batteryMaxCurrent": "valor A",
      "batteryType": "tipo",
      "batteryModel": "modelo",
      "acVoltageRange": "faixa V",
      "acFrequency": "Hz",
      "acNominalPower": "valor W",
      "acMaxApparentPower": "valor VA",
      "acNominalCurrent": "valor A",
      "acMaxCurrent": "valor A",
      "acThd": "%",
      "acInputNominalVoltage": "V",
      "acInputMaxCurrent": "A",
      "epsPeakPower": "VA",
      "epsSwitchTime": "ms",
      "securities": "lista de proteções separadas por vírgula",
      "dimensions": "L / A / P mm",
      "weight": "kg",
      "protection": "IPXX",
      "ui": "interface",
      "commBms": "tipo",
      "commMonitor": "tipo",
      "control": "tipo"
    }`}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });

  try {
    const text = response.text;
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return null;
  }
};
