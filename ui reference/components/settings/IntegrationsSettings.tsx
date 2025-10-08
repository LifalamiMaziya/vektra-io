import React from "react";
import {
  VercelLogo,
  StripeLogo,
  GoogleAnalyticsLogo,
  SupabaseLogo
} from "../Icons";

const IntegrationCard: React.FC<{
  icon: React.ReactNode;
  name: string;
  description: string;
}> = ({ icon, name, description }) => (
  <div className="bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg p-4 flex items-center gap-4">
    <div className="w-10 h-10 flex items-center justify-center text-white">
      {icon}
    </div>
    <div className="flex-grow">
      <h4 className="font-semibold text-white">{name}</h4>
      <p className="text-sm text-[#aaa]">{description}</p>
    </div>
    <button className="bg-[#333] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#444] text-sm">
      Connect
    </button>
  </div>
);

export const IntegrationsSettings: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Integrations</h2>
      <p className="text-[#aaa] mt-1">
        Connect third-party services to your project.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntegrationCard
          icon={<VercelLogo className="h-7 w-7" />}
          name="Vercel"
          description="Deploy your project with one click."
        />
        <IntegrationCard
          icon={<StripeLogo className="h-8 w-8" />}
          name="Stripe"
          description="Enable payments and subscriptions."
        />
        <IntegrationCard
          icon={<GoogleAnalyticsLogo className="h-8 w-8" />}
          name="Google Analytics"
          description="Track your website's traffic."
        />
        <IntegrationCard
          icon={<SupabaseLogo className="h-7 w-7" />}
          name="Supabase"
          description="Connect to a serverless database."
        />
      </div>
    </div>
  );
};
