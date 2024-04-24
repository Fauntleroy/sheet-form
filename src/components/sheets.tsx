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

function Cells({ cells }: { cells: string[] }) {
  return (
    <ul>
      {cells.map((cell: string) => (
        <li key={cell}>
          <label htmlFor={cell}>{cell}</label>
          <input type="text" name={cell} />
        </li>
      ))}
    </ul>
  );
}

export function Sheets() {
  const { accessToken } = useContext(AppContext);
  const [cells, setCells] = useState(null);
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

    console.log('spreadsheetData', spreadsheetData, spreadsheetData.cells);
    setCells(spreadsheetData.cells);
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
        {!cells && <div>Sheet data goes here</div>}
        {!!cells && <Cells cells={cells} />}
      </div>
    </div>
  );
}
