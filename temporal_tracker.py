"""
Temporal Style Evolution Tracker
Tracks how writing styles change over time with version history analysis,
style drift detection, and timeline visualization.
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
from pathlib import Path

try:
    import numpy as np
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.patches import Rectangle
    HAS_VIZ = True
except ImportError:
    HAS_VIZ = False

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except ImportError:
    client = None

console = Console()


@dataclass
class VersionSnapshot:
    """Represents a version snapshot of text at a point in time."""
    version_id: str
    timestamp: datetime
    text: str
    authenticity_score: float
    style_features: Dict[str, float]
    metadata: Dict


class TemporalTracker:
    """Tracks writing style evolution over time."""
    
    def __init__(self, storage_path: str = "./temporal_data"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        
        self.documents: Dict[str, List[VersionSnapshot]] = defaultdict(list)
        self._load_history()
    
    def add_version(self, document_id: str, text: str, 
                   timestamp: Optional[datetime] = None,
                   metadata: Optional[Dict] = None) -> VersionSnapshot:
        """Add a new version of a document."""
        if timestamp is None:
            timestamp = datetime.now()
        
        # Analyze text
        authenticity_score = self._analyze_authenticity(text)
        style_features = self._extract_style_features(text)
        
        version_id = f"{document_id}_v{len(self.documents[document_id]) + 1}"
        
        snapshot = VersionSnapshot(
            version_id=version_id,
            timestamp=timestamp,
            text=text,
            authenticity_score=authenticity_score,
            style_features=style_features,
            metadata=metadata or {}
        )
        
        self.documents[document_id].append(snapshot)
        self.documents[document_id].sort(key=lambda v: v.timestamp)
        
        self._save_history()
        
        return snapshot
    
    def _analyze_authenticity(self, text: str) -> float:
        """Analyze text authenticity using LLM."""
        if not client:
            # Fallback: simple heuristic
            return 0.7
        
        prompt = f"""Analyze this text for authenticity (0-1 scale where 1 = clearly human, 0 = clearly AI):

{text[:1500]}

Return only a single number between 0 and 1 representing authenticity score."""
        
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a text authenticity classifier. Return only numeric scores."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            import re
            score_match = re.search(r'([\d.]+)', response.choices[0].message.content)
            if score_match:
                score = float(score_match.group(1))
                return max(0.0, min(1.0, score))  # Clamp to [0, 1]
        except Exception as e:
            console.print(f"[yellow]Authenticity analysis failed: {e}[/yellow]")
        
        return 0.5  # Default
    
    def _extract_style_features(self, text: str) -> Dict[str, float]:
        """Extract style features from text."""
        import re
        
        words = re.findall(r'\b\w+\b', text.lower())
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        word_count = len(words)
        sentence_count = len(sentences)
        char_count = len(text)
        
        features = {
            "avg_sentence_length": word_count / sentence_count if sentence_count > 0 else 0,
            "avg_word_length": sum(len(w) for w in words) / word_count if word_count > 0 else 0,
            "lexical_diversity": len(set(words)) / word_count if word_count > 0 else 0,
            "punctuation_ratio": len(re.findall(r'[,.!?;:-]', text)) / char_count if char_count > 0 else 0,
            "caps_ratio": sum(1 for c in text if c.isupper()) / char_count if char_count > 0 else 0,
            "word_count": word_count,
            "sentence_count": sentence_count
        }
        
        return features
    
    def detect_style_drift(self, document_id: str, window_size: int = 3) -> Dict:
        """Detect style drift across versions."""
        versions = self.documents.get(document_id, [])
        
        if len(versions) < 2:
            return {"drift_detected": False, "drift_score": 0.0, "details": "Insufficient versions"}
        
        drifts = []
        drift_points = []
        
        for i in range(1, len(versions)):
            prev = versions[i-1]
            curr = versions[i]
            
            # Calculate drift in each feature
            feature_drifts = {}
            for key in prev.style_features.keys():
                if key in curr.style_features:
                    drift = abs(curr.style_features[key] - prev.style_features[key])
                    feature_drifts[key] = drift
            
            # Calculate overall drift score
            drift_score = sum(feature_drifts.values()) / len(feature_drifts) if feature_drifts else 0
            
            # Authenticity drift
            auth_drift = abs(curr.authenticity_score - prev.authenticity_score)
            
            total_drift = (drift_score + auth_drift) / 2
            
            if total_drift > 0.15:  # Threshold
                drift_points.append({
                    "from_version": prev.version_id,
                    "to_version": curr.version_id,
                    "timestamp": curr.timestamp,
                    "drift_score": total_drift,
                    "auth_drift": auth_drift,
                    "feature_drifts": feature_drifts
                })
            
            drifts.append(total_drift)
        
        avg_drift = sum(drifts) / len(drifts) if drifts else 0
        
        return {
            "drift_detected": len(drift_points) > 0,
            "drift_score": avg_drift,
            "drift_points": drift_points,
            "total_versions": len(versions),
            "significant_changes": len(drift_points)
        }
    
    def analyze_version_history(self, document_id: str) -> Dict:
        """Analyze version history for patterns."""
        versions = self.documents.get(document_id, [])
        
        if not versions:
            return {"error": "No versions found"}
        
        # Calculate trends
        authenticity_scores = [v.authenticity_score for v in versions]
        timestamps = [v.timestamp for v in versions]
        
        # Trend analysis
        if len(authenticity_scores) > 1:
            trend = "increasing" if authenticity_scores[-1] > authenticity_scores[0] else "decreasing"
            trend_magnitude = abs(authenticity_scores[-1] - authenticity_scores[0])
        else:
            trend = "stable"
            trend_magnitude = 0
        
        # Feature evolution
        feature_evolution = defaultdict(list)
        for version in versions:
            for key, value in version.style_features.items():
                feature_evolution[key].append(value)
        
        # Variance analysis
        variance_analysis = {}
        for key, values in feature_evolution.items():
            if len(values) > 1:
                variance_analysis[key] = {
                    "variance": float(np.var(values)) if hasattr(np, 'var') else 0,
                    "range": max(values) - min(values),
                    "trend": "increasing" if values[-1] > values[0] else "decreasing" if values[-1] < values[0] else "stable"
                }
        
        return {
            "document_id": document_id,
            "total_versions": len(versions),
            "time_span": {
                "start": timestamps[0].isoformat(),
                "end": timestamps[-1].isoformat(),
                "duration_days": (timestamps[-1] - timestamps[0]).days if len(timestamps) > 1 else 0
            },
            "authenticity_trend": {
                "direction": trend,
                "magnitude": trend_magnitude,
                "scores": authenticity_scores
            },
            "feature_evolution": variance_analysis,
            "drift_analysis": self.detect_style_drift(document_id)
        }
    
    def visualize_timeline(self, document_id: str, save_path: Optional[str] = None):
        """Visualize style evolution timeline."""
        if not HAS_VIZ:
            console.print("[yellow]Matplotlib not available. Install matplotlib for visualization.[/yellow]")
            return
        
        versions = self.documents.get(document_id, [])
        
        if len(versions) < 2:
            console.print("[yellow]Need at least 2 versions for timeline visualization.[/yellow]")
            return
        
        fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
        fig.suptitle(f'Style Evolution Timeline: {document_id}', fontsize=16, fontweight='bold')
        
        timestamps = [v.timestamp for v in versions]
        auth_scores = [v.authenticity_score for v in versions]
        
        # 1. Authenticity Score Timeline
        ax1 = axes[0]
        ax1.plot(timestamps, auth_scores, 'o-', linewidth=2, markersize=8, color='#2E86AB')
        ax1.fill_between(timestamps, auth_scores, alpha=0.3, color='#2E86AB')
        ax1.axhline(y=0.5, color='r', linestyle='--', alpha=0.5, label='Threshold')
        ax1.set_ylabel('Authenticity Score', fontsize=12)
        ax1.set_title('Authenticity Evolution', fontsize=13, fontweight='bold')
        ax1.set_ylim(0, 1)
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        
        # Mark drift points
        drift_analysis = self.detect_style_drift(document_id)
        if drift_analysis.get("drift_points"):
            for drift_point in drift_analysis["drift_points"]:
                drift_time = datetime.fromisoformat(drift_point["timestamp"].isoformat())
                idx = next((i for i, v in enumerate(versions) if v.version_id == drift_point["to_version"]), None)
                if idx is not None:
                    ax1.scatter([timestamps[idx]], [auth_scores[idx]], 
                              s=200, c='red', marker='*', zorder=5, label='Drift Point' if drift_point == drift_analysis["drift_points"][0] else '')
        
        # 2. Feature Evolution
        ax2 = axes[1]
        feature_keys = list(versions[0].style_features.keys())
        colors = plt.cm.Set3(np.linspace(0, 1, len(feature_keys)))
        
        for i, key in enumerate(feature_keys):
            feature_values = [v.style_features[key] for v in versions]
            # Normalize for display
            if max(feature_values) > 0:
                normalized = [v / max(feature_values) for v in feature_values]
            else:
                normalized = feature_values
            ax2.plot(timestamps, normalized, 'o-', label=key.replace('_', ' ').title(), 
                    color=colors[i], alpha=0.7, linewidth=1.5)
        
        ax2.set_ylabel('Normalized Feature Value', fontsize=12)
        ax2.set_title('Style Features Evolution', fontsize=13, fontweight='bold')
        ax2.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)
        ax2.grid(True, alpha=0.3)
        
        # 3. Drift Score Timeline
        ax3 = axes[2]
        drift_scores = []
        for i in range(1, len(versions)):
            prev = versions[i-1]
            curr = versions[i]
            drift = abs(curr.authenticity_score - prev.authenticity_score)
            drift_scores.append(drift)
        
        # Interpolate drift scores to match timestamps
        drift_timestamps = timestamps[1:]
        ax3.bar(range(len(drift_scores)), drift_scores, color='#A23B72', alpha=0.7)
        ax3.axhline(y=0.15, color='orange', linestyle='--', alpha=0.7, label='Drift Threshold')
        ax3.set_ylabel('Drift Score', fontsize=12)
        ax3.set_xlabel('Version Transitions', fontsize=12)
        ax3.set_title('Style Drift Detection', fontsize=13, fontweight='bold')
        ax3.set_xticks(range(len(drift_timestamps)))
        ax3.set_xticklabels([f"v{i}→v{i+1}" for i in range(1, len(versions))], rotation=45, ha='right')
        ax3.grid(True, alpha=0.3, axis='y')
        ax3.legend()
        
        plt.tight_layout()
        
        # Format x-axis
        if len(timestamps) > 1:
            span = (timestamps[-1] - timestamps[0]).days
            if span > 365:
                ax3.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
                ax3.xaxis.set_major_locator(mdates.MonthLocator(interval=max(1, span//365)))
            else:
                ax3.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            console.print(f"[green]Saved timeline to {save_path}[/green]")
        else:
            plt.show()
    
    def _save_history(self):
        """Save version history to disk."""
        data = {}
        for doc_id, versions in self.documents.items():
            data[doc_id] = [
                {
                    "version_id": v.version_id,
                    "timestamp": v.timestamp.isoformat(),
                    "text": v.text,
                    "authenticity_score": v.authenticity_score,
                    "style_features": v.style_features,
                    "metadata": v.metadata
                }
                for v in versions
            ]
        
        file_path = self.storage_path / "history.json"
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_history(self):
        """Load version history from disk."""
        file_path = self.storage_path / "history.json"
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                for doc_id, versions_data in data.items():
                    self.documents[doc_id] = [
                        VersionSnapshot(
                            version_id=v["version_id"],
                            timestamp=datetime.fromisoformat(v["timestamp"]),
                            text=v["text"],
                            authenticity_score=v["authenticity_score"],
                            style_features=v["style_features"],
                            metadata=v.get("metadata", {})
                        )
                        for v in versions_data
                    ]
            except Exception as e:
                console.print(f"[yellow]Could not load history: {e}[/yellow]")


def main():
    """Main entry point."""
    tracker = TemporalTracker()
    
    console.print(Panel.fit(
        "[bold cyan]📅 Temporal Style Evolution Tracker[/bold cyan]\n"
        "Track how writing styles change over time\n"
        "with version history analysis and drift detection.",
        border_style="cyan"
    ))
    
    while True:
        console.print("\n[cyan]Commands:[/cyan]")
        console.print("  1. [dim]add[/dim] - Add a new version")
        console.print("  2. [dim]analyze[/dim] - Analyze version history")
        console.print("  3. [dim]visualize[/dim] - Show timeline")
        console.print("  4. [dim]drift[/dim] - Detect style drift")
        console.print("  5. [dim]list[/dim] - List documents")
        console.print("  6. [dim]quit[/dim] - Exit\n")
        
        cmd = input("> ").strip().lower()
        
        if cmd == "quit":
            break
        elif cmd == "add":
            doc_id = input("Document ID: ").strip()
            console.print("[dim]Enter text (multiline, end with 'END' on new line):[/dim]")
            lines = []
            while True:
                line = input()
                if line.strip() == "END":
                    break
                lines.append(line)
            text = "\n".join(lines)
            
            snapshot = tracker.add_version(doc_id, text)
            console.print(f"[green]✓ Added version: {snapshot.version_id}[/green]")
            console.print(f"   Authenticity: {snapshot.authenticity_score:.3f}")
            console.print(f"   Timestamp: {snapshot.timestamp.isoformat()}")
        
        elif cmd == "analyze":
            doc_id = input("Document ID: ").strip()
            analysis = tracker.analyze_version_history(doc_id)
            
            if "error" in analysis:
                console.print(f"[red]{analysis['error']}[/red]")
                continue
            
            console.print(f"\n[bold]Analysis for: {doc_id}[/bold]")
            console.print(f"Versions: {analysis['total_versions']}")
            console.print(f"Time span: {analysis['time_span']['duration_days']} days")
            console.print(f"Authenticity trend: {analysis['authenticity_trend']['direction']} "
                         f"({analysis['authenticity_trend']['magnitude']:.3f})")
            
            drift = analysis['drift_analysis']
            console.print(f"\n[bold]Drift Analysis:[/bold]")
            console.print(f"  Detected: {drift['drift_detected']}")
            console.print(f"  Drift score: {drift['drift_score']:.3f}")
            console.print(f"  Significant changes: {drift['significant_changes']}")
        
        elif cmd == "visualize":
            doc_id = input("Document ID: ").strip()
            save = input("Save to file? (path or 'n'): ").strip()
            save_path = None if save.lower() == 'n' else save
            tracker.visualize_timeline(doc_id, save_path)
        
        elif cmd == "drift":
            doc_id = input("Document ID: ").strip()
            drift = tracker.detect_style_drift(doc_id)
            
            console.print(f"\n[bold]Drift Detection: {doc_id}[/bold]")
            console.print(f"Detected: {drift['drift_detected']}")
            console.print(f"Average drift: {drift['drift_score']:.3f}")
            
            if drift['drift_points']:
                table = Table(title="Drift Points")
                table.add_column("From", style="cyan")
                table.add_column("To", style="cyan")
                table.add_column("Drift Score", style="yellow")
                table.add_column("Auth Drift", style="magenta")
                
                for point in drift['drift_points']:
                    table.add_row(
                        point['from_version'],
                        point['to_version'],
                        f"{point['drift_score']:.3f}",
                        f"{point['auth_drift']:.3f}"
                    )
                console.print(table)
        
        elif cmd == "list":
            if tracker.documents:
                console.print("\n[bold]Documents:[/bold]")
                for doc_id, versions in tracker.documents.items():
                    console.print(f"  {doc_id}: {len(versions)} versions")
            else:
                console.print("[yellow]No documents tracked yet.[/yellow]")


if __name__ == "__main__":
    main()
