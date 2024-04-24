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
    await firstSheet.loadCells('A1:C1');
    const cellA1 = firstSheet.getCellByA1('A1');
    const cellB1 = firstSheet.getCellByA1('B1');
    const cellC1 = firstSheet.getCellByA1('C1');

    return NextResponse.json(
      {
        message: 'Sheet read successfully.',
        cells: [cellA1.value, cellB1.value, cellC1.value]
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
