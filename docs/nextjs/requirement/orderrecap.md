# ORDER RECAPITULATION
Create report of order recapitulation
Before display report user must select project and contract by selected project
display report by following this report layout:

Laporan Rekapitulasi Pekerjaan
Nama Proyek => project_id
Alamat Proyek => project_address
Nomor Proyek => project_number
Jadwal Pekerjaan => null
Periode s/d => project_startdt - project_enddt

----------------------------------------------------------------------------------------------
|     | Uraian Pekerjaan   |    RAP      |    Pengeluaran Proyek       |    Saldo Proyek RAP  |
| No. |                    |             |   Bobot  |    Nilai         |  Bobot |    Nilai    |
|-----|--------------------|-------------|-----------------------------|-----------------------
|  A  |         B          |      C      |     D    |        E         |    F   |      G      |
|-----|--------------------|-------------|-----------------------------|-----------------------
| A   | PREPARATION WORK   |             |          |                  |        |             |
| B   | DEMOLISH WORK      |             |          |                  |        |             |
| C   | CIVIL WORK         |             |          |                  |        |             |
| D   | FINISHING WORK     |             |          |                  |        |             |
| E   | INTERIOR WORK      |             |          |                  |        |             |
| F   | MEP WORK           |             |          |                  |        |             |
| G   | LANDSCAPE WORK     |             |          |                  |        |             |
| H   | OTHER WORK         |             |          |                  |        |             |
----------------------------------------------------------------------------------------------
| Total                    |             |          |                  |        |             |
----------------------------------------------------------------------------------------------


Column A : sheetgroup_code
Column B : sheetgroup_name
Column C : sheet_netamt from contractsheet and group by sheetgroup_id
Column D : (Column E/Column C) x 100
Column E : sheet_netamt from ordersheet and group by sheetgroup_id
Column F : (Column G/Column C) x 100
Column G : Column C - Column E
