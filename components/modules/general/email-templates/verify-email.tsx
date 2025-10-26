import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
    Link,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailTemplateProps {
    firstName: string;
    verificationLink: string;
    trainerName?: string;
}

export const VerifyEmailTemplate = ({
    firstName,
    verificationLink,
    trainerName,
}: VerifyEmailTemplateProps) => {
    return (
        <Html>
            <Head>
                <style>{`
                    @media only screen and (max-width: 600px) {
                        .mobile-padding {
                            padding: 24px 20px !important;
                        }
                        .mobile-heading {
                            font-size: 20px !important;
                        }
                        .mobile-text {
                            font-size: 14px !important;
                        }
                        .mobile-button {
                            padding: 14px 32px !important;
                            font-size: 14px !important;
                        }
                        .mobile-header {
                            padding: 30px 20px !important;
                        }
                        .mobile-header-title {
                            font-size: 28px !important;
                        }
                        .mobile-footer {
                            padding: 24px 20px !important;
                        }
                    }
                `}</style>
            </Head>
            <Preview>Verify your email to get started with ProTribe</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header} className="mobile-header">
                        <Heading style={headerTitle} className="mobile-header-title">ProTribe</Heading>
                        <Text style={headerSubtitle} className="mobile-text">Our Journey Starts Here</Text>
                    </Section>

                    {/* Content */}
                    <Section style={content} className="mobile-padding">
                        <Heading style={greeting} className="mobile-heading">Hi {firstName}! 👋</Heading>

                        <Text style={paragraph} className="mobile-text">
                            Welcome to <strong>ProTribe</strong>!{" "}
                            {trainerName
                                ? `We're excited to have you join ${trainerName}'s training program.`
                                : "We're excited to have you on board!"}
                        </Text>

                        <Text style={paragraph} className="mobile-text">
                            To get started, please verify your email address by clicking the
                            button below:
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={verificationLink} className="mobile-button">
                                Verify Email Address
                            </Button>
                        </Section>

                        {/* Info Box */}
                        <Section style={infoBox} className="mobile-padding">
                            <Text style={infoTitle} className="mobile-text">Button not working?</Text>
                            <Text style={infoText} className="mobile-text">
                                Copy and paste this link into your browser:
                            </Text>
                            <Link href={verificationLink} style={linkText} className="mobile-text">
                                {verificationLink}
                            </Link>
                        </Section>

                        {/* Security Note */}
                        <Hr style={divider} />
                        <Text style={securityText} className="mobile-text">
                            <strong>⚠️ Security tip:</strong> This verification link will
                            expire in 24 hours for your security.
                        </Text>
                        <Text style={securityText} className="mobile-text">
                            If you didn't create an account with ProTribe, please ignore this
                            email.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer} className="mobile-footer">
                        <Text style={footerText} className="mobile-text">
                            Best regards,
                            <br />
                            <strong>The ProTribe Team</strong>
                        </Text>
                        <Hr style={footerDivider} />
                        <Text style={disclaimer} className="mobile-text">
                            © {new Date().getFullYear()} ProTribe. All rights reserved.
                        </Text>
                        <Text style={disclaimer} className="mobile-text">
                            This email was sent to you as part of your ProTribe account
                            registration.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles using Tailwind-inspired colors and spacing
const main = {
    backgroundColor: "#f3f4f6",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
    padding: "40px 16px",
    width: "100%",
};

const container = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header = {
    backgroundColor: "#2b7fff", // Primary color from app (blue-indigo)
    padding: "40px 30px",
    textAlign: "center" as const,
};

const headerTitle = {
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0",
    letterSpacing: "-0.5px",
};

const headerSubtitle = {
    color: "#ffffff",
    fontSize: "16px",
    margin: "10px 0 0 0",
    opacity: 0.9,
};

const content = {
    padding: "50px 40px",
};

const greeting = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 20px 0",
};

const paragraph = {
    color: "#6b7280",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
};

const buttonContainer = {
    textAlign: "center" as const,
    padding: "10px 0 30px 0",
};

const button = {
    backgroundColor: "#2b7fff", // Primary color from app (blue-indigo)
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "16px 48px",
    boxShadow: "0 4px 12px rgba(107, 127, 245, 0.4)",
};

const infoBox = {
    backgroundColor: "#f9fafb",
    borderLeft: "4px solid #2b7fff",
    borderRadius: "4px",
    padding: "16px 20px",
    marginBottom: "30px",
    wordBreak: "break-word" as const,
};

const infoTitle = {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px 0",
};

const infoText = {
    color: "#9ca3af",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
};

const linkText = {
    color: "#2b7fff",
    fontSize: "13px",
    margin: "8px 0 0 0",
    wordBreak: "break-all" as const,
    display: "block",
    textDecoration: "none",
};

const divider = {
    borderColor: "#e5e7eb",
    margin: "24px 0",
};

const securityText = {
    color: "#9ca3af",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 8px 0",
};

const footer = {
    backgroundColor: "#f9fafb",
    padding: "30px 40px",
    borderTop: "1px solid #e5e7eb",
};

const footerText = {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 12px 0",
};

const footerDivider = {
    borderColor: "#e5e7eb",
    margin: "20px 0",
};

const disclaimer = {
    color: "#d1d5db",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 8px 0",
};

export default VerifyEmailTemplate;

