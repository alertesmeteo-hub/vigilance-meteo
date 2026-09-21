/** Régions de France métropolitaine (13 régions depuis 2016, dont la Corse) et leurs départements. */
export const REGIONS: { code: string; nom: string; departements: string[] }[] = [
  { code: 'ARA', nom: 'Auvergne-Rhône-Alpes', departements: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'] },
  { code: 'BFC', nom: 'Bourgogne-Franche-Comté', departements: ['21', '25', '39', '58', '70', '71', '89', '90'] },
  { code: 'BRE', nom: 'Bretagne', departements: ['22', '29', '35', '56'] },
  { code: 'CVL', nom: 'Centre-Val de Loire', departements: ['18', '28', '36', '37', '41', '45'] },
  { code: 'COR', nom: 'Corse', departements: ['2A', '2B'] },
  { code: 'GES', nom: 'Grand Est', departements: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'] },
  { code: 'HDF', nom: 'Hauts-de-France', departements: ['02', '59', '60', '62', '80'] },
  { code: 'IDF', nom: 'Île-de-France', departements: ['75', '77', '78', '91', '92', '93', '94', '95'] },
  { code: 'NOR', nom: 'Normandie', departements: ['14', '27', '50', '61', '76'] },
  { code: 'NAQ', nom: 'Nouvelle-Aquitaine', departements: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'] },
  { code: 'OCC', nom: 'Occitanie', departements: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'] },
  { code: 'PDL', nom: 'Pays de la Loire', departements: ['44', '49', '53', '72', '85'] },
  { code: 'PAC', nom: "Provence-Alpes-Côte d'Azur", departements: ['04', '05', '06', '13', '83', '84'] },
];
