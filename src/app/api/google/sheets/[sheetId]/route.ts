import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function GET(
  request: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const accessToken = request.headers.get('X-Access-Token');

    if (!accessToken) {
      throw new Error('No access token found.');
    }

    const spreadsheet = new GoogleSpreadsheet(params.sheetId, {
      token: accessToken
    });
    await spreadsheet.loadInfo();
    const firstSheet = spreadsheet.sheetsByIndex[0];
    await firstSheet.loadCells({
      startColumnIndex: 0,
      endColumnIndex: firstSheet.columnCount,
      startRowIndex: 0,
      endRowIndex: firstSheet.rowCount
    });

    const fieldNames = [];
    const entries: any[] = [];
    let rowIndex = 0;

    while (!!firstSheet.getCell(rowIndex, 0).value) {
      // field names
      if (rowIndex === 0) {
        let colIndex = 0;
        while (!!firstSheet.getCell(rowIndex, colIndex).value) {
          const currentCell = firstSheet.getCell(rowIndex, colIndex);
          fieldNames.push(currentCell.value);

          colIndex++;
        }
      } else {
        // field entries
        const entry: any[] = [];

        let colIndex = 0;
        while (!!firstSheet.getCell(rowIndex, colIndex).value) {
          const currentCell = firstSheet.getCell(rowIndex, colIndex);
          const fieldName = fieldNames[colIndex];
          const field = {
            name: fieldName,
            value: currentCell.value
          };
          entry.push(field);

          colIndex++;
        }

        entries.push(entry);
      }

      rowIndex++;
    }

    return NextResponse.json(
      {
        message: 'Sheet read successfully.',
        entries
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const accessToken = request.headers.get('X-Access-Token');

    if (!accessToken) {
      throw new Error('No access token found');
    }

    if (!request.body) {
      throw new Error('Request body is empty');
    }

    const body = await request.json();

    const spreadsheet = new GoogleSpreadsheet(params.sheetId, {
      token: accessToken
    });
    await spreadsheet.loadInfo();
    const firstSheet = spreadsheet.sheetsByIndex[0];
    await firstSheet.loadCells('A1:C2');
    body.fieldUpdates.forEach((fieldValue: string, fieldIndex: number) => {
      const fieldValueCell = firstSheet.getCell(1, fieldIndex);
      fieldValueCell.value = fieldValue;
    });
    await firstSheet.saveUpdatedCells();

    return NextResponse.json(
      {
        message: 'Sheet updated successfully.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const accessToken = request.headers.get('X-Access-Token');

    if (!accessToken) {
      throw new Error('No access token found');
    }

    if (!request.body) {
      throw new Error('Request body is empty');
    }

    const body = await request.json();

    const spreadsheet = new GoogleSpreadsheet(params.sheetId, {
      token: accessToken
    });
    await spreadsheet.loadInfo();
    const firstSheet = spreadsheet.sheetsByIndex[0];
    const newRowIndex = firstSheet.rowCount + 1;
    body.fieldValues.forEach((fieldValue: string, fieldIndex: number) => {
      const fieldValueCell = firstSheet.getCell(newRowIndex, fieldIndex);
      fieldValueCell.value = fieldValue;
    });
    await firstSheet.saveUpdatedCells();

    return NextResponse.json(
      {
        message: 'New row added to sheet successfully.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
