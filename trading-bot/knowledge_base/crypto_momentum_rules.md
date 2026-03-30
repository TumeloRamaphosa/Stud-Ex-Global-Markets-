# Crypto Momentum Strategy — Rules & Knowledge

## Entry Conditions (ALL must align)

### Multi-Timeframe Confirmation
All three timeframes (1h, 4h, 1d) must show the same directional bias.
If any timeframe disagrees, NO TRADE.

### Individual Timeframe Scoring (+1 to -1 per factor)

1. **Trend (EMA)**: Price > EMA(12) > EMA(26) = bullish (+1)
2. **RSI Momentum**: RSI between 40-70 = healthy momentum (+1). Above 80 = overbought (-1)
3. **MACD Histogram**: Positive and increasing = bullish (+1). Negative = bearish (-1)
4. **Volume**: Current volume > 1.5x 20-period SMA = confirmed (+1)
5. **ADX Trend Strength**: ADX > 25 = trending (+1). ADX < 15 = ranging (-0.5)
6. **Bollinger Position**: Above middle band = bullish (+0.5)

### Minimum Score for Entry
- Total timeframe score must be >= 3 (out of 6 max per timeframe)
- All timeframes must be positive (no mixed signals)

## Exit Rules

### Stop Loss
- 2x ATR(14) below entry price
- HARD STOP — no exceptions, no moving

### Take Profit
- 4x ATR(14) above entry (2:1 risk/reward minimum)
- Can use trailing stop of 2 ATR once in profit

### Forced Exit Conditions
- RSI crosses above 80 → close 50% of position
- MACD histogram turns negative → close remaining
- ADX drops below 20 → close all (trend dying)

## Position Sizing
- Maximum 5% of portfolio per crypto position
- Maximum 30% total crypto exposure
- Use ATR-based sizing: Risk = 1% of equity / (2 × ATR)

## Known Edge Decay Signals
- Win rate dropping below 40% over 20 trades → pause strategy
- Average hold time increasing → market becoming choppy
- Volume confirmations failing more often → liquidity drying up

## Best Performing Conditions
- Strong trending markets (ADX > 30)
- After major support/resistance breaks
- When BTC dominance is stable (not rapidly shifting)
- During Asian and US trading session overlaps

## Worst Performing Conditions
- Weekend trading (low liquidity)
- During major news events (FOMC, CPI releases)
- When market is in tight range (ADX < 15)
- During exchange-specific issues (liquidation cascades)
