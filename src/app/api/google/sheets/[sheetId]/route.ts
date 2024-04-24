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
    await firstSheet.loadCells('A1:C2');
    const cellA1 = firstSheet.getCellByA1('A1');
    const cellB1 = firstSheet.getCellByA1('B1');
    const cellC1 = firstSheet.getCellByA1('C1');
    const cellA2 = firstSheet.getCellByA1('A2');
    const cellB2 = firstSheet.getCellByA1('B2');
    const cellC2 = firstSheet.getCellByA1('C2');

    const fields = [cellA1.value, cellB1.value, cellC1.value];
    const values = [cellA2.value, cellB2.value, cellC2.value];

    return NextResponse.json(
      {
        message: 'Sheet read successfully.',
        fields,
        values
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
    const nameCell = firstSheet.getCellByA1('A2');
    nameCell.value = body.fieldUpdates['Name'];
    await firstSheet.saveUpdatedCells();

    return NextResponse.json(
      {
        message: 'Sheet updated successfully.'
      },
      { status: 200 }
    );

    console.log('request body', body);
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
