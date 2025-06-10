import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Campaign } from "../types";
import { Button } from "./ui/Button";

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card">
      <div className="relative h-48">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-semibold text-white mb-1">
            {campaign.title}
          </h3>
          <p className="text-sm text-white/90 line-clamp-2">
            {campaign.description}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Início</p>
            <p className="font-medium text-gray-900">
              {format(new Date(campaign.startDate), "dd 'de' MMMM", {
                locale: ptBR
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Término</p>
            <p className="font-medium text-gray-900">
              {format(new Date(campaign.endDate), "dd 'de' MMMM", {
                locale: ptBR
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              campaign.status === "active"
                ? "bg-success-100 text-success-700"
                : campaign.status === "completed"
                ? "bg-primary-100 text-primary-700"
                : "bg-error-100 text-error-700"
            }`}
          >
            {campaign.status === "active"
              ? "Ativa"
              : campaign.status === "completed"
              ? "Concluída"
              : "Cancelada"}
          </span>

          <Link to={`/campanhas/${campaign.id}`}>
            <Button variant="outline" size="sm">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
