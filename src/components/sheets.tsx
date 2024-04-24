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

async function addEntryToSpreadsheet(
  spreadsheetId: string,
  fieldValues: (string | null)[],
  accessToken: string
) {
  const addEntryToSpreadsheet = await fetch(
    `/api/google/sheets/${spreadsheetId}`,
    {
      method: 'POST',
      headers: {
        'X-Access-Token': accessToken
      },
      body: JSON.stringify({
        fieldValues
      })
    }
  );
  const addEntryToSpreadsheetJson = await addEntryToSpreadsheet.json();
  return addEntryToSpreadsheetJson;
}

function EntryView({ fields }: { fields: any[] }) {
  const formRef = useRef(null);

  return (
    <table>
      <thead>
        <tr>
          {fields.map(({ name }, i) => (
            <th key={`${name}-${i}`}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {fields.map(({ value }, i) => (
            <td key={`${value}-${i}`}>{value}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function EntryCreate({
  fieldNames,
  spreadsheetId
}: {
  fieldNames: any[];
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
    const fieldValues = Array.from(formData.values());
    const createResult = await addEntryToSpreadsheet(
      spreadsheetId,
      fieldValues,
      accessToken
    );
    formRef.current.reset();
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div>
        <strong>Create New Entry</strong>
      </div>
      <ul>
        {fieldNames.map((field: string, i: number) => (
          <li key={field}>
            <label htmlFor={field}>{field}</label>
            <input type="text" name={field} defaultValue={''} />
          </li>
        ))}
      </ul>
      <button type="submit">Create New Entry</button>
    </form>
  );
}

export function Sheets() {
  const { accessToken } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
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
    setFieldNames(spreadsheetData.fieldNames);
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
        {entries.length === 0 && <div>Sheet data goes here</div>}
        {entries.length > 0 &&
          entries.map((entry, i) => {
            return <EntryView fields={entry} key={`entry-${i}`} />;
          })}
        {fieldNames.length > 0 && (
          <div>
            <EntryCreate
              fieldNames={fieldNames}
              spreadsheetId={spreadsheetId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
