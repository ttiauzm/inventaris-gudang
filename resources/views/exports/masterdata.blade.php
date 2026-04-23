<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #2d2d2d; }
        h2 { font-size: 20px; margin-bottom: 2px; }
        .sub { font-size: 11px; color: #777; margin-bottom: 16px; }
        h3 { font-size: 14px; margin-top: 28px; margin-bottom: 8px; color: #6B5B4E; border-bottom: 2px solid #8B7B6E; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #8B7B6E; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5ddd5; font-size: 11px; }
        tr:nth-child(even) td { background: #FAF6F1; }
        tr:nth-child(odd) td { background: #ffffff; }
    </style>
</head>
<body>
    <h2>Laporan Master Data</h2>
    <p class="sub">Digenerate: {{ $generated_at }}</p>

    <h3>Kategori</h3>
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

    <h3>Material</h3>
    <table>
        <thead>
            <tr>
                <th style="width:40px">No</th>
                <th>Nama Material</th>
                <th>Deskripsi</th>
                <th style="width:110px">Tanggal Dibuat</th>
            </tr>
        </thead>
        <tbody>
            @foreach($materials as $i => $mat)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $mat->material_name }}</td>
                <td>{{ $mat->description ?? '-' }}</td>
                <td>{{ optional($mat->created_at)->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
