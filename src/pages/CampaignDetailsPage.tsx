import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import {
  getCampaignById,
  getCampaignTickets,
  getBuyerRanking,
  purchaseTickets
} from "../services/campaignService";
import { Campaign, CampaignTicket, BuyerRanking } from "../types";
import { toast } from "react-hot-toast";

export const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tickets, setTickets] = useState<CampaignTicket[]>([]);
  const [ranking, setRanking] = useState<BuyerRanking[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [campaignData, ticketsData, rankingData] = await Promise.all([
          getCampaignById(id),
          getCampaignTickets(id),
          getBuyerRanking(id)
        ]);

        setCampaign(campaignData);
        setTickets(ticketsData);
        setRanking(rankingData);
      } catch (error) {
        console.error("Erro ao carregar dados da campanha:", error);
        toast.error("Erro ao carregar dados da campanha");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [id]);

  const handleTicketSelect = (ticketNumber: number) => {
    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(selectedTickets.filter((n) => n !== ticketNumber));
    } else {
      setSelectedTickets([...selectedTickets, ticketNumber]);
    }
  };

  const handlePurchase = async () => {
    if (!user || !id || selectedTickets.length === 0) return;

    try {
      setIsLoading(true);
      await purchaseTickets(id, user.id, selectedTickets);
      toast.success("Bilhetes comprados com sucesso!");
      setSelectedTickets([]);
      // Recarregar dados
      const [ticketsData, rankingData] = await Promise.all([
        getCampaignTickets(id),
        getBuyerRanking(id)
      ]);
      setTickets(ticketsData);
      setRanking(rankingData);
    } catch (error) {
      console.error("Erro ao comprar bilhetes:", error);
      toast.error("Erro ao comprar bilhetes");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Campanha não encontrada
            </h1>
            <Button onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho da Campanha */}
          <div className="mb-8">
            <div className="relative h-64 rounded-lg overflow-hidden mb-6">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {campaign.title}
                </h1>
                <p className="text-white/90">{campaign.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-card p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Data de Início
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(campaign.startDate), "dd 'de' MMMM", {
                    locale: ptBR
                  })}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-card p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Data de Término
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(campaign.endDate), "dd 'de' MMMM", {
                    locale: ptBR
                  })}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-card p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Status
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === "active"
                      ? "bg-success-100 text-success-800"
                      : campaign.status === "completed"
                      ? "bg-primary-100 text-primary-800"
                      : "bg-error-100 text-error-800"
                  }`}
                >
                  {campaign.status === "active"
                    ? "Ativa"
                    : campaign.status === "completed"
                    ? "Concluída"
                    : "Cancelada"}
                </span>
              </div>
            </div>
          </div>

          {/* Grid de Bilhetes */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Bilhetes</h2>
              {selectedTickets.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedTickets.length} bilhetes selecionados
                  </span>
                  <Button onClick={handlePurchase} isLoading={isLoading}>
                    Comprar Bilhetes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tickets.map((ticket) => (
                <button
                  key={ticket.number}
                  onClick={() => handleTicketSelect(ticket.number)}
                  disabled={ticket.status !== "available"}
                  className={`relative p-4 rounded-lg border-2 text-center transition-colors ${
                    ticket.status === "available"
                      ? selectedTickets.includes(ticket.number)
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-300"
                      : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="text-lg font-semibold">{ticket.number}</span>
                  {ticket.isPrize && (
                    <span className="absolute top-1 right-1 text-xs font-medium text-primary-600">
                      Prêmio
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking de Compradores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Ranking de Compradores
            </h3>
            {ranking.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets Comprados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ranking.map((ranking, index) => {
                      const participationPercentage =
                        (ranking.ticketsBought / campaign.totalTickets) * 100;
                      return (
                        <tr key={ranking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}º
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ranking.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ranking.ticketsBought}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {participationPercentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum comprador ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
