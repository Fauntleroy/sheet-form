'use client';

import { useContext, useState } from 'react';

import { AppContext } from '@/context';

async function getSpreadsheet(spreadsheetId: string, accessToken: string) {
  const spreadsheetResponse = await fetch(
    `/api/google/sheets/${spreadsheetId}`,
    {
      method: 'GET',
      headers: {
        'X-Access-Token': accessToken
      },
      body: null
    }
  );
  const spreadSheetJson = await spreadsheetResponse.json();
  console.log('spreadsheet json', spreadSheetJson);
  return spreadSheetJson;
}

function Cells({ fields, values }: { fields: string[]; values: string[] }) {
  function handleSubmit(event) {
    event.preventDefault();
    console.log('update cells here', event.formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <ul>
        {fields.map((field: string, i: number) => (
          <li key={field}>
            <label htmlFor={field}>{field}</label>
            <input type="text" name={field} value={values[i] || ''} />
          </li>
        ))}
      </ul>
      <button type="submit">Update Cells</button>
    </form>
  );
}

export function Sheets() {
  const { accessToken } = useContext(AppContext);
  const [fields, setFields] = useState(null);
  const [values, setValues] = useState(null);
  const hasAccessToken: boolean = !!accessToken;

  async function handleCreateNewSheetClick() {
    console.log('accessToken', accessToken);
    const response = await fetch('/api/google/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': accessToken
      },
      body: null
    });
    const responseJson = await response.json();

    console.log('create new sheet response', responseJson);
  }

  async function handleLoadSheetDataClick() {
    const spreadsheetData = await getSpreadsheet(
      '1rBYGkKmV4aCJOOmesdEw5B6s6bSfSPMRrnlhUlxf2_o',
      accessToken
    );

    setFields(spreadsheetData.fields);
    setValues(spreadsheetData.values);
  }

  return (
    <div>
      <h3>Sheets</h3>
      <div>
        {hasAccessToken && (
          <button onClick={handleCreateNewSheetClick}>Create New Sheet</button>
        )}
      </div>
      <hr />
      <div>
        {hasAccessToken && (
          <button onClick={handleLoadSheetDataClick}>Load Sheet Data</button>
        )}
        {!fields && <div>Sheet data goes here</div>}
        {!!fields && !!values && <Cells fields={fields} values={values} />}
      </div>
    </div>
  );
}
