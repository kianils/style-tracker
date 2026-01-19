"""
Dataset Evaluator for Temporal Style Evolution Tracker
Evaluates the system's performance using the Human vs LLM Text Corpus dataset
from Kaggle: https://www.kaggle.com/datasets/starblasters8/human-vs-llm-text-corpus
Uses kagglehub library for dataset download
"""

import os
import json
import pandas as pd
from typing import Dict, List, Tuple, Optional
from pathlib import Path
from datetime import datetime

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, track

try:
    import kagglehub
except ImportError:
    kagglehub = None
    console = Console()
    console.print("[yellow]Warning: kagglehub not installed. Install with: pip install kagglehub[/yellow]")

# Import temporal tracker
from temporal_tracker import TemporalTracker

console = Console()


class DatasetEvaluator:
    """Evaluates the Temporal Tracker using the Human vs LLM Text Corpus dataset."""
    
    def __init__(self, tracker: TemporalTracker):
        self.tracker = tracker
        self.results: List[Dict] = []
    
    def download_dataset(self) -> str:
        """Download the Kaggle dataset using kagglehub."""
        if not kagglehub:
            raise ImportError("kagglehub is required. Install with: pip install kagglehub")
        
        console.print("[cyan]Downloading dataset from Kaggle...[/cyan]")
        console.print("Dataset: starblasters8/human-vs-llm-text-corpus")
        
        try:
            # Download latest version
            path = kagglehub.dataset_download("starblasters8/human-vs-llm-text-corpus")
            console.print(f"[green]✓ Dataset downloaded to: {path}[/green]")
            return path
        except Exception as e:
            console.print(f"[red]Error downloading dataset: {e}[/red]")
            console.print("\n[dim]Tip: Make sure you've accepted the dataset's terms on Kaggle[/dim]")
            raise
    
    def load_dataset(self, dataset_path: str) -> pd.DataFrame:
        """Load the CSV file from the downloaded dataset."""
        console.print(f"[cyan]Loading dataset from: {dataset_path}[/cyan]")
        
        dataset_dir = Path(dataset_path)
        
        # Try common CSV files in the dataset
        possible_files = [
            "train.csv",
            "data.csv",
            "dataset.csv",
            "human_vs_llm.csv",
            "text_corpus.csv",
            "human-vs-llm-text-corpus.csv"
        ]
        
        csv_file = None
        for file_name in possible_files:
            file_path = dataset_dir / file_name
            if file_path.exists():
                csv_file = file_path
                break
        
        if csv_file is None:
            # List all CSV files in the directory
            csv_files = list(dataset_dir.glob("*.csv"))
            if csv_files:
                csv_file = csv_files[0]
                console.print(f"[yellow]Using first CSV found: {csv_file.name}[/yellow]")
            else:
                # Try subdirectories
                for subdir in dataset_dir.iterdir():
                    if subdir.is_dir():
                        csv_files = list(subdir.glob("*.csv"))
                        if csv_files:
                            csv_file = csv_files[0]
                            console.print(f"[yellow]Using CSV from subdirectory: {csv_file}[/yellow]")
                            break
                
                if csv_file is None:
                    raise FileNotFoundError(f"No CSV files found in {dataset_path} or subdirectories")
        
        # Load CSV
        df = pd.read_csv(csv_file)
        
        console.print(f"[green]✓ Loaded {len(df)} rows from {csv_file.name}[/green]")
        console.print(f"Columns: {list(df.columns)}")
        
        return df
    
    def normalize_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize dataset to expected format."""
        normalized = df.copy()
        
        # Try to identify columns
        text_col = None
        label_col = None
        
        # Try to find text column (case-insensitive search)
        text_candidates = ['text', 'content', 'sentence', 'paragraph', 'document', 'article', 'message']
        for col in df.columns:
            if col.lower() in text_candidates:
                text_col = col
                break
        
        if text_col is None:
            # Use first non-numeric column as text
            object_cols = df.select_dtypes(include=['object', 'string']).columns
            if len(object_cols) > 0:
                text_col = object_cols[0]
                console.print(f"[yellow]Using '{text_col}' as text column (first string column)[/yellow]")
        
        # Try to find label column (case-insensitive search)
        label_candidates = ['label', 'class', 'is_human', 'is_ai', 'source', 'type', 'category', 'target']
        for col in df.columns:
            if col.lower() in label_candidates:
                label_col = col
                break
        
        # Normalize labels
        if label_col:
            normalized['is_human'] = normalized[label_col].apply(self._normalize_label)
            console.print(f"[cyan]Using label column: '{label_col}'[/cyan]")
        else:
            console.print("[yellow]Warning: No label column found. All texts will be analyzed but not evaluated.[/yellow]")
            normalized['is_human'] = None
        
        # Rename text column to 'text'
        if text_col and text_col != 'text':
            normalized['text'] = normalized[text_col]
        
        console.print(f"[cyan]Using text column: '{text_col if text_col else 'text'}'[/cyan]")
        
        return normalized[['text', 'is_human']].copy()
    
    def _normalize_label(self, label: any) -> Optional[int]:
        """Normalize label to binary: 1 = human, 0 = AI."""
        if pd.isna(label):
            return None
        
        label_str = str(label).lower().strip()
        
        # Human indicators
        if label_str in ['human', '1', 'true', 'yes', 'h', 'real', 'original']:
            return 1
        # AI indicators
        elif label_str in ['ai', 'llm', 'gpt', '0', 'false', 'no', 'a', 'synthetic', 'generated', 'fake']:
            return 0
        else:
            return None
    
    def evaluate_on_dataset(self, df: pd.DataFrame, sample_size: Optional[int] = None, 
                           create_versions: bool = False) -> Dict:
        """Evaluate the tracker on the dataset."""
        normalized_df = self.normalize_dataset(df)
        
        # Filter out rows without labels if evaluating
        has_labels = normalized_df['is_human'].notna().any()
        if has_labels:
            evaluation_df = normalized_df[normalized_df['is_human'].notna()].copy()
        else:
            evaluation_df = normalized_df.copy()
            console.print("[yellow]No labels available - running analysis only (no accuracy calculation)[/yellow]")
        
        # Sample if requested
        if sample_size and len(evaluation_df) > sample_size:
            evaluation_df = evaluation_df.sample(n=sample_size, random_state=42)
            console.print(f"[cyan]Sampling {sample_size} rows for evaluation[/cyan]")
        
        self.results = []
        correct_predictions = 0
        total_evaluated = 0
        
        console.print(f"\n[bold]Evaluating on {len(evaluation_df)} texts...[/bold]\n")
        
        with Progress() as progress:
            task = progress.add_task("[cyan]Evaluating...", total=len(evaluation_df))
            
            for idx, row in evaluation_df.iterrows():
                text = str(row['text'])
                true_label = row['is_human']
                
                # Skip empty text
                if not text or len(text.strip()) < 10:
                    progress.update(task, advance=1)
                    continue
                
                # Analyze text
                authenticity_score = self.tracker._analyze_authenticity(text)
                
                # Predict: score > 0.5 = human, <= 0.5 = AI
                predicted_label = 1 if authenticity_score > 0.5 else 0
                
                # Store result
                result = {
                    "index": int(idx),
                    "text_preview": text[:100] + "..." if len(text) > 100 else text,
                    "true_label": "human" if true_label == 1 else "ai" if true_label == 0 else "unknown",
                    "predicted_label": "human" if predicted_label == 1 else "ai",
                    "authenticity_score": float(authenticity_score),
                    "correct": None
                }
                
                if true_label is not None:
                    result["correct"] = (predicted_label == true_label)
                    if result["correct"]:
                        correct_predictions += 1
                    total_evaluated += 1
                
                self.results.append(result)
                
                # Optionally create version history for temporal analysis
                if create_versions:
                    doc_id = f"eval_doc_{idx}"
                    self.tracker.add_version(doc_id, text, metadata={"source": "kaggle_dataset", "true_label": true_label})
                
                progress.update(task, advance=1)
        
        # Calculate metrics
        accuracy = correct_predictions / total_evaluated if total_evaluated > 0 else None
        
        metrics = {
            "total_texts": len(evaluation_df),
            "evaluated": total_evaluated,
            "correct": correct_predictions,
            "accuracy": accuracy,
            "results": self.results
        }
        
        return metrics
    
    def display_evaluation_results(self, metrics: Dict):
        """Display evaluation results in a formatted table."""
        console.print("\n" + "="*60)
        console.print("[bold cyan]Evaluation Results[/bold cyan]")
        console.print("="*60)
        
        if metrics["accuracy"] is not None:
            console.print(f"\n[bold]Overall Accuracy: {metrics['accuracy']:.2%}[/bold]")
            console.print(f"Correct: {metrics['correct']} / {metrics['evaluated']}")
        
        # Confusion matrix
        if metrics["accuracy"] is not None:
            confusion = self._calculate_confusion_matrix()
            
            table = Table(title="Confusion Matrix")
            table.add_column("", style="cyan")
            table.add_column("Predicted: Human", style="green")
            table.add_column("Predicted: AI", style="red")
            
            table.add_row(
                "Actual: Human",
                str(confusion["true_human_pred_human"]),
                str(confusion["true_human_pred_ai"])
            )
            table.add_row(
                "Actual: AI",
                str(confusion["true_ai_pred_human"]),
                str(confusion["true_ai_pred_ai"])
            )
            
            console.print("\n")
            console.print(table)
            
            # Calculate precision, recall, F1
            tp = confusion["true_human_pred_human"]
            fp = confusion["true_ai_pred_human"]
            fn = confusion["true_human_pred_ai"]
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            console.print(f"\n[bold]Additional Metrics:[/bold]")
            console.print(f"  Precision: {precision:.2%}")
            console.print(f"  Recall: {recall:.2%}")
            console.print(f"  F1 Score: {f1:.2%}")
        
        # Score distribution
        human_scores = [r["authenticity_score"] for r in self.results if r.get("true_label") == "human"]
        ai_scores = [r["authenticity_score"] for r in self.results if r.get("true_label") == "ai"]
        
        if human_scores and ai_scores:
            console.print(f"\n[bold]Score Distribution:[/bold]")
            console.print(f"  Human texts - Avg: {sum(human_scores)/len(human_scores):.3f}, "
                         f"Min: {min(human_scores):.3f}, Max: {max(human_scores):.3f}")
            console.print(f"  AI texts - Avg: {sum(ai_scores)/len(ai_scores):.3f}, "
                         f"Min: {min(ai_scores):.3f}, Max: {max(ai_scores):.3f}")
    
    def _calculate_confusion_matrix(self) -> Dict[str, int]:
        """Calculate confusion matrix from results."""
        confusion = {
            "true_human_pred_human": 0,
            "true_human_pred_ai": 0,
            "true_ai_pred_human": 0,
            "true_ai_pred_ai": 0
        }
        
        for result in self.results:
            if result.get("correct") is None:
                continue
            
            true = result["true_label"]
            pred = result["predicted_label"]
            
            if true == "human" and pred == "human":
                confusion["true_human_pred_human"] += 1
            elif true == "human" and pred == "ai":
                confusion["true_human_pred_ai"] += 1
            elif true == "ai" and pred == "human":
                confusion["true_ai_pred_human"] += 1
            elif true == "ai" and pred == "ai":
                confusion["true_ai_pred_ai"] += 1
        
        return confusion
    
    def save_results(self, output_path: str):
        """Save evaluation results to JSON file."""
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "results": self.results,
            "summary": {
                "total": len(self.results),
                "evaluated": sum(1 for r in self.results if r.get("correct") is not None),
                "correct": sum(1 for r in self.results if r.get("correct") == True),
                "accuracy": sum(1 for r in self.results if r.get("correct")) / len([r for r in self.results if r.get("correct") is not None]) if any(r.get("correct") is not None for r in self.results) else None
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        console.print(f"\n[green]✓ Results saved to {output_path}[/green]")


def main():
    """Main entry point for dataset evaluation."""
    console.print(Panel.fit(
        "[bold cyan]📊 Dataset Evaluator[/bold cyan]\n"
        "Evaluate Temporal Tracker using Human vs LLM Text Corpus\n"
        "Kaggle: https://www.kaggle.com/datasets/starblasters8/human-vs-llm-text-corpus",
        border_style="cyan"
    ))
    
    # Check kagglehub
    if not kagglehub:
        console.print("\n[red]Error: kagglehub is not installed.[/red]")
        console.print("Install with: [cyan]pip install kagglehub[/cyan]")
        return
    
    # Initialize tracker
    tracker = TemporalTracker()
    evaluator = DatasetEvaluator(tracker)
    
    # Download or use existing dataset
    console.print("\n[cyan]Dataset Options:[/cyan]")
    console.print("  1. Download from Kaggle (recommended)")
    console.print("  2. Use existing local path")
    
    choice = input("\nChoice (1 or 2, default=1): ").strip() or "1"
    
    if choice == "1":
        try:
            dataset_path = evaluator.download_dataset()
        except Exception as e:
            console.print(f"[red]Failed to download: {e}[/red]")
            return
    else:
        dataset_path = input("Enter path to dataset folder: ").strip()
        if not dataset_path:
            console.print("[red]No path provided[/red]")
            return
    
    # Load dataset
    try:
        df = evaluator.load_dataset(dataset_path)
    except Exception as e:
        console.print(f"[red]Error loading dataset: {e}[/red]")
        return
    
    # Ask for sample size
    sample_input = input("\nEnter sample size (press Enter to use all data): ").strip()
    sample_size = int(sample_input) if sample_input else None
    
    # Ask if creating versions
    create_versions_input = input("\nCreate version history for temporal analysis? (y/n): ").strip().lower()
    create_versions = create_versions_input == 'y'
    
    # Evaluate
    metrics = evaluator.evaluate_on_dataset(df, sample_size=sample_size, create_versions=create_versions)
    
    # Display results
    evaluator.display_evaluation_results(metrics)
    
    # Save results
    save = input("\nSave results to file? (path or 'n'): ").strip()
    if save.lower() != 'n':
        output_path = save if save else "evaluation_results.json"
        evaluator.save_results(output_path)


if __name__ == "__main__":
    main()
