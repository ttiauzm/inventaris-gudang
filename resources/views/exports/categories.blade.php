<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #2d2d2d; }
        h2 { font-size: 20px; margin-bottom: 2px; }
        .sub { font-size: 11px; color: #777; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #8B7B6E; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5ddd5; font-size: 11px; }
        tr:nth-child(even) td { background: #FAF6F1; }
        tr:nth-child(odd) td { background: #ffffff; }
    </style>
</head>
<body>
    <h2>Laporan Kategori</h2>
    <p class="sub">Tanggal Cetak: {{ $generated_at }}</p>
    <table>
        <thead>
            <tr>
                <th style="width:40px">No</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th style="width:110px">Tanggal Dibuat</th>
            </tr>
        </thead>
        <tbody>
            @foreach($categories as $i => $cat)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $cat->category_name }}</td>
                <td>{{ $cat->description ?? '-' }}</td>
                <td>{{ optional($cat->created_at)->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
