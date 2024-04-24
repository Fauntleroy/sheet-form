import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('X-Access-Token');

    if (!accessToken) {
      throw new Error('No access token found.');
    }

    const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(
      { token: accessToken },
      {
        title: 'This is a new doc'
      }
    );
    console.log(doc.spreadsheetId);

    return NextResponse.json(
      { message: 'Sheet created successfully.', sheetId: doc.spreadsheetId },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
