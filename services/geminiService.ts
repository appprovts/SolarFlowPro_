
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project, SurveyData } from "../types";

// Initialize the API with the key from environment variables
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeSurvey = async (survey: SurveyData, project: Project) => {
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    return "Erro: Chave de API do Gemini não configurada. Verifique o arquivo .env.local.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analise os seguintes dados de vistoria técnica fotovoltaica e forneça recomendações de engenharia:
    Cliente: ${project.clientName}
    Potência Estimada: ${project.powerKwp} kWp
    
    1. Telhado e Estrutura:
    - Material: ${survey.roofType}
    - Orientação: ${survey.roofOrientation}
    - Inclinação: ${survey.inclination}°
    - Condição: ${survey.roofCondition}
    - Capacidade de Carga: ${survey.roofLoadCapacity || 'Não informado'}

    2. Elétrica:
    - Conexão: ${survey.connectionType} - ${survey.voltage}
    - Disjuntor Geral: ${survey.breakerCurrent} A
    - Local do Quadro: ${survey.panelLocation}
    - Consumo Médio: ${survey.averageConsumption} kWh
    
    3. Condições Locais:
    - Sombreamento: ${survey.shadingIssues} (Período: ${survey.shadingPeriod || 'N/A'}, Ângulo: ${survey.shadingAngle || 'N/A'})
    - Facilidade de Acesso: ${survey.accessEase}
    - Segurança: ${survey.safetyConditions}

    4. Equipamentos Existentes:
    - Tipo: ${survey.existingEquipmentType || 'Nenhum'}
    - Condição: ${survey.existingEquipmentCondition}
    - Reutilização Possível: ${survey.structureReusePossible ? 'Sim' : 'Não'}

    5. Dados Ambientais e Cliente:
    - Irradiação: ${survey.averageIrradiation || 'N/A'} Wh/m²
    - Objetivo: ${survey.clientObjectives || 'N/A'}
    
    Forneça uma análise técnica concisa sobre a viabilidade, sugestões de melhoria no layout, adequação dos equipamentos existentes e alertas de segurança.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing survey:", error);
    return "Erro ao gerar análise. Tente novamente mais tarde.";
  }
};

export const generateTechnicalMemorial = async (project: Project) => {
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    return "Erro: Chave de API do Gemini não configurada.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    Gere um rascunho de Memorial Descritivo para submissão à concessionária de energia.
    Dados do Projeto:
    - Cliente: ${project.clientName}
    - Endereço: ${project.address}
    - Potência do Gerador: ${project.powerKwp} kWp
    - Produção Mensal Estimada: ${project.estimatedProduction} kWh
    
    O documento deve conter: Introdução, Descrição do Sistema, Características Técnicas dos Equipamentos (módulos e inversor), e Proteções. Use um tom profissional e técnico de engenharia elétrica.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating memorial:", error);
    return "Erro ao gerar memorial. Tente novamente mais tarde.";
  }
};

export const getEquipmentSpecs = async (brand: string, modelName: string, type: 'Módulo' | 'Inversor') => {
  if (!apiKey) return null;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `
    Aja como um engenheiro fotovoltaico especialista. 
    Retorne APENAS um objeto JSON válido com as especificações técnicas REAIS para o seguinte equipamento:
    Marca: ${brand}
    Modelo: ${modelName}
    Tipo: ${type}

    ${type === 'Módulo' ? `
    Use este schema:
    {
      "pmax": "valor em W",
      "tolerance": "ex: 0~+5W",
      "vmp": "valor em V",
      "imp": "valor em A",
      "voc": "valor em V",
      "isc": "valor em A",
      "efficiency": "valor em %"
    }` : `
    Use este schema:
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (e) {
    console.error('Error parsing AI response:', e);
    return null;
  }
};
