import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ServiceCard from '@/components/integration/ServiceCard';
import ConfigureModal from '@/components/integration/ConfigureModal';
import PoeRouter from '@/components/integration/PoeRouter';
import { Loader2, Bot, Zap, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SERVICE_KEYS } from '@/lib/integrationServices';

export default function Home() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configureService, setConfigureService] = useState(null);

  const loadConnections = async () => {
    try {
      const data = await base44.entities.Connection.list();
      setConnections(data);
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const connectionsByService = (serviceKey) =>
    connections.find((c) => c.service === serviceKey) || null;

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading">Poe AI Integration Hub</h1>
              <p className="text-sm text-muted-foreground">
                Connect WhatsApp, Telegram, Discord & Steam — route messages with AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">{connectedCount} of {SERVICE_KEYS.length} services connected</span>
            </div>
            <Link to="/canvas">
              <Button variant="outline" size="sm">
                <Network className="w-4 h-4 mr-1.5" />
                Thought Canvas
              </Button>
            </Link>
          </div>
        </div>

        {/* Service Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {SERVICE_KEYS.map((key) => (
              <ServiceCard
                key={key}
                serviceKey={key}
                connection={connectionsByService(key)}
                onConfigure={(service) => setConfigureService(service)}
              />
            ))}
          </div>
        )}

        {/* Poe AI Router */}
        <PoeRouter connections={connections} />

        {/* Footer note */}
        <p className="text-xs text-muted-foreground mt-6 text-center max-w-2xl mx-auto">
          Poe AI routing is live via the built-in LLM integration. Service credentials are stored securely
          in your database — use the configure buttons to connect each platform.
        </p>
      </div>

      {/* Configure Modal */}
      {configureService && (
        <ConfigureModal
          serviceKey={configureService}
          connection={connectionsByService(configureService)}
          open={true}
          onClose={() => setConfigureService(null)}
          onSave={loadConnections}
        />
      )}
    </div>
  );
}
