import React from "react";
import { Checkbox, Text } from "rizzui";

interface TaxAccordionProps {
  cgst?: number;
  sgst?: number;
  amount?: number;
  show: boolean;
  handleApplyTaxes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  symbol:string;
}

const TaxAccordion: React.FC<TaxAccordionProps> = ({
  cgst = 9,
  sgst = 9,
  amount = 1000,
  handleApplyTaxes,
  show,
  symbol
}) => {
  const totalTax = ((cgst + sgst) * amount) / 100;

  const taxData = [
    { label: "CGST", value: `${cgst}% (${symbol} ${(cgst * amount) / 100})` },
    { label: "SGST", value: `${sgst}% (${symbol} ${(sgst * amount) / 100})` },
    { label: "Total Tax Amount", value: `${symbol} ${totalTax}` },
  ];

  return (
    <div className="w-full relative border border-gray-400 rounded-lg p-4">
      <Checkbox
        label="Apply Taxes"
        checked={show}
        onChange={handleApplyTaxes}
      />
      <div 
        className={` overflow-hidden transition-all duration-200 ${
          show ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2 mt-4 mx-8">
          {taxData.map((item, index) => (
            <div key={index} className="flex justify-between ">
              <Text className={`text-gray-900 ${index===2?'font-semibold':''}`}>
                {item.label}
              </Text>
              <Text className={`font-medium ${index===2?'font-semibold':''}`}>{item.value}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxAccordion;