import React from 'react';
import CodeView from '../CodeView.tsx';

export default () => (
  <CodeView style={{ margin: 'auto', marginBottom: '50px' }}>
    {`
import Scaffold, { browserConfig } from 'https://github.com/scaffold/scaffold/raw/v1.0.0/index.ts';

const scaffold = new Scaffold(browserConfig);

const contractHash = 'dda8ecfd22ea2b9fd670cd43cadd553ebfe35dac89a5552ab15fd1cf3eca21bd';

scaffold.fetch(
  \`scf://\${contractHash}/profile.id.123/post.id.456/get\`,
  (response) => console.log(response),
);
`.trim()}
  </CodeView>
);
