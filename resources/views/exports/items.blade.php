<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #2d2d2d; }
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
    <h2>Laporan Inventory Barang</h2>
    <p class="sub">Digenerate: {{ $generated_at }}</p>
    <table>
        <thead>
            <tr>
                <th style="width:40px">No</th>
                <th>Nama Barang</th>
                <th>Supplier</th>
                <th>Kategori</th>
                <th>Material</th>
                <th>Stok</th>
                <th>Satuan</th>
                <th>Harga</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->item_name }}</td>
                <td>{{ $item->suppliers->first()->supplier_name ?? '-' }}</td>
                <td>{{ $item->categories->category_name ?? '-' }}</td>
                <td>{{ $item->materials->material_name ?? '-' }}</td>
                <td>{{ number_format($item->quantity, 0, ',', '.') }}</td>
                <td>{{ $item->unit }}</td>
                <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>