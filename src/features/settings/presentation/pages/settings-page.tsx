import { useRouterState } from "@tanstack/react-router";
import { SettingsLayout } from "../components/settings-layout";
import { ProfileSettings } from "../components/profile-settings";
import { CredentialsSettings } from "../components/credentials-settings";
import { AddCredentialSection } from "../components/add-credential-section";
import { ApiKeySection } from "../components/api-key-section";

export function SettingsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const renderContent = () => {
    switch (pathname) {
      case "/settings/credentials/create":
        return <AddCredentialSection />;
      case "/settings/credentials":
        return <CredentialsSettings />;
      case "/settings/api-keys":
        return <ApiKeySection />;
      case "/settings":
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {pathname !== "/settings/credentials/create" && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and integration credentials.
          </p>
        </div>
      )}
      <SettingsLayout>
        {renderContent()}
      </SettingsLayout>
    </div>
  );
}
