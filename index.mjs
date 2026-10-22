import * as echarts from 'echarts';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

// 1. 出力先ディレクトリの作成
const OUTPUT_DIR = './output_charts';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 2. 実行OSに応じた標準日本語フォントの自動判定
let defaultFont = 'Noto Sans CJK JP'; // Linux (GitHub Codespaces / Chromebook)

if (process.platform === 'darwin') {
  defaultFont = 'Hiragino Sans';      // macOS
} else if (process.platform === 'win32') {
  defaultFont = 'Yu Gothic';          // Windows
}

// 3. 入力データ（CSVやJSONを読み込む場合はここを置き換えます）
const datasets = [
  {
    name: '東京支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [120, 190, 150, 220, 260, 310]
  },
  {
    name: '大阪支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [90, 140, 200, 180, 230, 270]
  },
  {
    name: '福岡支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [80, 110, 130, 160, 190, 210]
  }
];

// 4. 1枚のグラフをPNGバッファに変換する関数
function renderChartToPng(item) {
  // SVGレンダラー・SSRモードでインスタンス化
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width: 800,
    height: 500
  });

  // グラフオプションの設定
  chart.setOption({
    // 日本語フォントを全体に適用
    textStyle: {
      fontFamily: defaultFont
    },
    title: {
      text: `${item.name} 2026年上半期 売上実績`,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333'
      }
    },
    grid: {
      top: 80,
      left: 60,
      right: 40,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: item.labels,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '売上（万円）',
      nameTextStyle: {
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '売上',
        type: 'bar',
        data: item.values,
        barWidth: '40%',
        itemStyle: {
          color: '#5470c6',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 11
        }
      }
    ]
  });

  // SVG文字列を生成
  const svgString = chart.renderToSVGString();

  // ループ処理でのメモリリークを防ぐため破棄
  chart.dispose();

  // resvgでSVGからPNGへ変換
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: 800 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: defaultFont
    }
  });

  return resvg.render().asPng();
}

// 5. ループ実行して画像を順次保存
console.log(`使用フォント: ${defaultFont}`);
console.log('グラフ生成を開始します...');

for (const item of datasets) {
  const pngBuffer = renderChartToPng(item);
  const outputPath = path.join(OUTPUT_DIR, `${item.name}.png`);

  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`- 出力完了: ${outputPath}`);
}

console.log(`完了: ${datasets.length} 件の画像を ${OUTPUT_DIR} に保存しました。`);