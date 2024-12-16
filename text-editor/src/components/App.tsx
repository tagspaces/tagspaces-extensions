import { useEffect } from "react";
import { I18nextProvider, useTranslation } from 'react-i18next';
import { MUIThemeProvider } from '@tagspaces/tagspaces-extension-ui';
import { sendMessageToHost } from '../utils';

interface Props {
  children: any;
}
function App(props: Props) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // mdContent is not received without this message.
    sendMessageToHost({ command: 'loadDefaultTextContent' });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <MUIThemeProvider>{props.children}</MUIThemeProvider>
    </I18nextProvider>
  );
}

export default App;
