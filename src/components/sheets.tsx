'use client';

import { useContext, useState, useRef } from 'react';

import { AppContext } from '@/context';

const SPREADSHEET_ID = '1rBYGkKmV4aCJOOmesdEw5B6s6bSfSPMRrnlhUlxf2_o';

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

async function updateSpreadsheet(
  spreadsheetId: string,
  fieldUpdates: (string | null)[],
  accessToken: string
) {
  const updateSpreadsheetResponse = await fetch(
    `/api/google/sheets/${spreadsheetId}`,
    {
      method: 'PUT',
      headers: {
        'X-Access-Token': accessToken
      },
      body: JSON.stringify({
        fieldUpdates
      })
    }
  );
  const updateSpreadsheetResponseJson = await updateSpreadsheetResponse.json();
  return updateSpreadsheetResponseJson;
}

function Cells({
  fields,
  spreadsheetId
}: {
  fields: any[];
  spreadsheetId: string;
}) {
  const { accessToken } = useContext(AppContext);
  const formRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formRef.current) {
      console.error('form element does not exist');
      return;
    }

    const formData = new FormData(formRef.current);
    const formValues = Array.from(formData.values());
    const updateResult = await updateSpreadsheet(
      spreadsheetId,
      formValues,
      accessToken
    );
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <ul>
        {fields.map((field: { name: string; value: string }, i: number) => (
          <li key={field.name}>
            <label htmlFor={field.name}>{field.name}</label>
            <input
              type="text"
              name={field.name}
              defaultValue={field.value || ''}
            />
          </li>
        ))}
      </ul>
      <button type="submit">Update Cells</button>
    </form>
  );
}

export function Sheets() {
  const { accessToken } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const hasAccessToken: boolean = !!accessToken;
  const spreadsheetId = SPREADSHEET_ID; // temporary constant value

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
    const spreadsheetData = await getSpreadsheet(spreadsheetId, accessToken);

    setEntries(spreadsheetData.entries);
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
        {!entries && <div>Sheet data goes here</div>}
        {!!entries &&
          entries.map((entry, i) => {
            return (
              <Cells
                fields={entry}
                spreadsheetId={spreadsheetId}
                key={`entry-${i}`}
              />
            );
          })}
      </div>
    </div>
  );
}
