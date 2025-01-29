import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Amplify } from 'aws-amplify';
import {
  Container,
  Header,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Button,
} from "@cloudscape-design/components";

/**
 * Component for managing application configuration
 * Handles AWS service configuration and credentials
 * @param {Object} props - Component properties
 * @param {Function} props.onConfigSet - Callback when configuration is saved
 * @param {boolean} props.isEditingConfig - Flag indicating edit mode
 * @param {Function} props.setEditingConfig - Function to update edit mode
 * @returns {JSX.Element} Configuration form interface
 */
const ConfigComponent = ({ onConfigSet, isEditingConfig, setEditingConfig }) => {
  
  /**
   * Configuration state schema
   * Contains AWS service endpoints and credentials
   */
  const [config, setConfig] = useState({
    // Cognito authentication configuration
    cognito: {
      userPoolId: '',
      userPoolClientId: '',
      region: '',
      identityPoolId: ''
    },
    bedrock: {
      agentName: '',
      agentId: '',
      agentAliasId: '',
      region: ''
    }
  });
  const [errors, setErrors] = useState({});

  const configureAmplify = useCallback((config) => {
    Amplify.configure({
      Auth: {
        Cognito: {
          region: config.cognito.region,
          userPoolId: config.cognito.userPoolId,
          userPoolClientId: config.cognito.userPoolClientId,
          identityPoolId: config.cognito.identityPoolId
        },
      }
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate Cognito fields
    if (!config.cognito.userPoolId.trim()) {
      newErrors.userPoolId = 'User Pool ID is required';
    }
    if (!config.cognito.userPoolClientId.trim()) {
      newErrors.userPoolClientId = 'User Pool Client ID is required';
    }
    if (!config.cognito.identityPoolId.trim()) {
      newErrors.identityPoolId = 'Identity Pool ID is required';
    }
    if (!config.cognito.region.trim()) {
      newErrors.cognitoRegion = 'Cognito Region is required';
    }

    // Validate Bedrock fields
    if (!config.bedrock.agentId.trim()) {
      newErrors.agentId = 'Agent ID is required';
    }
    if (!config.bedrock.agentAliasId.trim()) {
      newErrors.agentAliasId = 'Agent Alias ID is required';
    }
    if (!config.bedrock.region.trim()) {
      newErrors.bedrockRegion = 'Bedrock Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const storedConfig = localStorage.getItem('appConfig');
    if (storedConfig && !isEditingConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      configureAmplify(parsedConfig);
    }else if(storedConfig && isEditingConfig){
      const parsedConfig = JSON.parse(storedConfig);
      console.log("loading configuration")
      setConfig(parsedConfig);
    }
  }, [isEditingConfig, onConfigSet, configureAmplify]);

  const handleInputChange = (section, field, value) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem('appConfig', JSON.stringify(config));
      configureAmplify(config);
      setEditingConfig(false);
      onConfigSet();
    }
  };

  return (
    // <ContentLayout>
      <div style={{ maxWidth: '600px', margin: '0 auto', overflow: 'auto', height: '100vh'}}>
        <Container>
          <div style={{ width: '100%', marginBottom: '10px', borderBottom: '1px solid #c3c3c3', paddingBottom: '5px'}}>
            <Header
              variant="h1"
              description="Let's configure your Amazon Bedrock Agent client application"
              headingTagOverride="h1"
              textAlign="left"
            >
              Welcome
            </Header>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Form
              actions={
                <Button variant="primary" formAction="submit">
                  {isEditingConfig? "Update configuration" : "Save configuration"}
                </Button>
              }
            >
              <SpaceBetween size="l">
                <Container
                  header={
                    <Header variant="h2">Amazon Cognito setup</Header>
                  }
                >
                  <SpaceBetween size="l">
                    <FormField 
                      label="User Pool ID" 
                      isRequired 
                      errorText={errors.userPoolId}
                    >
                      <Input
                        value={config.cognito.userPoolId}
                        isRequired
                        placeholder='e.g. us-east-1_uXboG5pAb'
                        onChange={({ detail }) => {
                          handleInputChange('cognito', 'userPoolId', detail.value);
                          setErrors({...errors, userPoolId: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="User Pool Client ID" 
                      isRequired 
                      errorText={errors.userPoolClientId}
                    >
                      <Input
                        value={config.cognito.userPoolClientId}
                        isRequired
                        placeholder='e.g. 25ddkmj4v6hfsfvruhpfi7n4hv'
                        onChange={({ detail }) => {
                          handleInputChange('cognito', 'userPoolClientId', detail.value);
                          setErrors({...errors, userPoolClientId: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="Identity Pool ID" 
                      isRequired
                      errorText={errors.identityPoolId}
                    >
                      <Input
                        value={config.cognito.identityPoolId}
                        isRequired
                        placeholder='e.g. us-east-1:a0421ced-2ae0-45ab-a503-21f6f23c5562'
                        onChange={({ detail }) => {
                          handleInputChange('cognito', 'identityPoolId', detail.value);
                          setErrors({...errors, identityPoolId: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="Region" 
                      isRequired
                      errorText={errors.cognitoRegion}
                    >
                      <Input
                        value={config.cognito.region}
                        isRequired
                        placeholder='e.g. us-east-1'
                        onChange={({ detail }) => {
                          handleInputChange('cognito', 'region', detail.value);
                          setErrors({...errors, cognitoRegion: ''});
                        }}
                      />
                    </FormField>
                  </SpaceBetween>
                </Container>
            
                <Container
                  header={
                    <Header variant="h2">Amazon Bedrock Agent setup</Header>
                  }
                >
                  <SpaceBetween size="l">
                    <FormField 
                      label="Agent Name"
                      errorText={errors.agentName}
                    >
                      <Input
                        value={config.bedrock.agentName}
                        placeholder='e.g. MyAgent'
                        onChange={({ detail }) => {
                          handleInputChange('bedrock', 'agentName', detail.value);
                          setErrors({...errors, agentName: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="Agent ID" 
                      isRequired
                      errorText={errors.agentId}
                    >
                      <Input
                        value={config.bedrock.agentId}
                        isRequired
                        placeholder='e.g. UF1W5WKVYI'
                        onChange={({ detail }) => {
                          handleInputChange('bedrock', 'agentId', detail.value);
                          setErrors({...errors, agentId: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="Agent Alias ID" 
                      isRequired
                      errorText={errors.agentAliasId}
                    >
                      <Input
                        value={config.bedrock.agentAliasId}
                        isRequired
                        placeholder='e.g. TSTALIASID (by default will point to your draft)'
                        onChange={({ detail }) => {
                          handleInputChange('bedrock', 'agentAliasId', detail.value);
                          setErrors({...errors, agentAliasId: ''});
                        }}
                      />
                    </FormField>
                    <FormField 
                      label="Region" 
                      isRequired
                      errorText={errors.bedrockRegion}
                    >
                      <Input
                        value={config.bedrock.region}
                        isRequired
                        placeholder='e.g. us-east-1'
                        onChange={({ detail }) => {
                          handleInputChange('bedrock', 'region', detail.value);
                          setErrors({...errors, bedrockRegion: ''});
                        }}
                      />
                    </FormField>
                  </SpaceBetween>
                </Container>
              </SpaceBetween>
            </Form>
          </form>
        </Container>
      </div>
    // </ContentLayout>
  );
};

ConfigComponent.propTypes = {
  onConfigSet: PropTypes.func.isRequired,
  setEditingConfig: PropTypes.func.isRequired,
  isEditingConfig: PropTypes.bool.isRequired
};

export default ConfigComponent;
